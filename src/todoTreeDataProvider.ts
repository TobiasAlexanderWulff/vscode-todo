import * as l10n from '@vscode/l10n';
import * as vscode from 'vscode';

import { TodoRepository } from './todoRepository';
import { Todo } from './types';

export type ProviderMode = 'global' | 'projects';

export type TreeNode = TodoNode | WorkspaceFolderNode;

export interface TodoNode {
	kind: 'todo';
	todo: Todo;
}

export interface WorkspaceFolderNode {
	kind: 'workspace';
	folder: vscode.WorkspaceFolder;
}

const TREE_MIME_BASE = 'application/vnd.code.tree.';

export class TodoTreeDataProvider implements vscode.TreeDataProvider<TreeNode>, vscode.Disposable {
	private readonly _onDidChangeTreeData = new vscode.EventEmitter<TreeNode | void>();
	private readonly workspaceDisposable: vscode.Disposable;
	private readonly dndController: TodoTreeDragAndDropController;
	private readonly treeMimeType: string;

	constructor(
		private readonly repository: TodoRepository,
		private readonly mode: ProviderMode,
		private readonly treeViewId: string
	) {
		this.treeMimeType = `${TREE_MIME_BASE}${treeViewId.toLowerCase()}`;
		this.workspaceDisposable = vscode.workspace.onDidChangeWorkspaceFolders(() => this.refresh());
		this.dndController = new TodoTreeDragAndDropController(
			this.repository,
			this,
			this.mode,
			this.treeMimeType
		);
	}

	get onDidChangeTreeData(): vscode.Event<TreeNode | void> {
		return this._onDidChangeTreeData.event;
	}

	get dragAndDropController(): vscode.TreeDragAndDropController<TreeNode> {
		return this.dndController;
	}

	refresh(node?: TreeNode): void {
		this._onDidChangeTreeData.fire(node);
	}

	dispose(): void {
		this.workspaceDisposable.dispose();
		this._onDidChangeTreeData.dispose();
		this.dndController.dispose();
	}

	getTreeItem(element: TreeNode): vscode.TreeItem {
		if (element.kind === 'workspace') {
			const item = new vscode.TreeItem(
				element.folder.name,
				vscode.TreeItemCollapsibleState.Collapsed
			);
			item.contextValue = 'todo:workspaceFolder';
			const todos = this.repository.getWorkspaceTodos(element.folder.uri.toString());
			item.description = l10n.t('tree.todo.count', '{0} TODOs', todos.length);
			return item;
		}
		const item = new vscode.TreeItem(element.todo.title, vscode.TreeItemCollapsibleState.None);
		item.contextValue =
			element.todo.scope === 'global' ? 'todo:globalItem' : 'todo:workspaceItem';
		item.tooltip = element.todo.completed
			? l10n.t('tree.todo.completedTooltip', 'Completed at {0}', element.todo.updatedAt)
			: undefined;
		item.iconPath = new vscode.ThemeIcon(element.todo.completed ? 'check' : 'circle-large-outline');
		item.description = element.todo.completed
			? l10n.t('tree.todo.completedLabel', 'Completed')
			: undefined;
		item.id =
			element.todo.scope === 'global'
				? `global:${element.todo.id}`
				: `workspace:${element.todo.workspaceFolder}:${element.todo.id}`;
		return item;
	}

	getChildren(element?: TreeNode): TreeNode[] {
		if (this.mode === 'global') {
			if (element) {
				return [];
			}
			return this.repository
				.getGlobalTodos()
				.sort((a, b) => a.position - b.position)
				.map((todo) => ({ kind: 'todo', todo }));
		}
		if (!element) {
			return (vscode.workspace.workspaceFolders ?? []).map((folder) => ({
				kind: 'workspace',
				folder,
			}));
		}
		if (element.kind === 'workspace') {
			return this.repository
				.getWorkspaceTodos(element.folder.uri.toString())
				.sort((a, b) => a.position - b.position)
				.map((todo) => ({ kind: 'todo', todo }));
		}
		return [];
	}

	getParent(element: TreeNode): TreeNode | undefined {
		if (this.mode === 'global') {
			return undefined;
		}
		if (element.kind === 'todo' && element.todo.workspaceFolder) {
			const folder = this.getWorkspaceFolderByKey(element.todo.workspaceFolder);
			if (folder) {
				return { kind: 'workspace', folder };
			}
		}
		return undefined;
	}

	getWorkspaceFolderByKey(key?: string): vscode.WorkspaceFolder | undefined {
		if (!key) {
			return undefined;
		}
		return (vscode.workspace.workspaceFolders ?? []).find(
			(folder) => folder.uri.toString() === key
		);
	}

	get modeLabel(): string {
		return this.mode;
	}

	get mimeType(): string {
		return this.treeMimeType;
	}
}

interface DragPayload {
	id: string;
	scope: 'global' | 'workspace';
	workspaceFolder?: string;
}

class TodoTreeDragAndDropController
	implements vscode.TreeDragAndDropController<TreeNode>, vscode.Disposable
{
	readonly dropMimeTypes: readonly string[];
	readonly dragMimeTypes: readonly string[];

	constructor(
		private readonly repository: TodoRepository,
		private readonly provider: TodoTreeDataProvider,
		private readonly mode: ProviderMode,
		private readonly mimeType: string
	) {
		this.dropMimeTypes = [mimeType];
		this.dragMimeTypes = [mimeType];
	}

	handleDrag(source: readonly TreeNode[], dataTransfer: vscode.DataTransfer): void {
		const payload: DragPayload[] = source
			.filter((node): node is TodoNode => node.kind === 'todo')
			.map((node) => ({
				id: node.todo.id,
				scope: node.todo.scope,
				workspaceFolder: node.todo.workspaceFolder,
			}));
		if (payload.length > 0) {
			dataTransfer.set(this.mimeType, new vscode.DataTransferItem(payload));
		}
	}

	async handleDrop(target: TreeNode | undefined, dataTransfer: vscode.DataTransfer): Promise<void> {
		const transferItem = dataTransfer.get(this.mimeType);
		if (!transferItem) {
			return;
		}
		const payload = transferItem.value as DragPayload[] | string;
		const dragged =
			Array.isArray(payload) && payload.length > 0
				? payload[0]
				: JSON.parse(typeof payload === 'string' ? payload : '[]')[0];
		if (!dragged) {
			return;
		}

		if (this.mode === 'global') {
			if (dragged.scope !== 'global') {
				return;
			}
			await this.reorderTodos(this.repository.getGlobalTodos(), dragged.id, undefined, target);
		} else {
			if (dragged.scope !== 'workspace' || !dragged.workspaceFolder) {
				return;
			}
			const folderKey = this.resolveWorkspaceKey(target) ?? dragged.workspaceFolder;
			if (folderKey !== dragged.workspaceFolder) {
				return;
			}
			await this.reorderTodos(
				this.repository.getWorkspaceTodos(folderKey),
				dragged.id,
				folderKey,
				target
			);
		}
	}

	private resolveWorkspaceKey(target?: TreeNode): string | undefined {
		if (!target) {
			return undefined;
		}
		if (target.kind === 'workspace') {
			return target.folder.uri.toString();
		}
		return target.todo.workspaceFolder;
	}

	private async reorderTodos(
		todos: Todo[],
		draggedId: string,
		workspaceFolder: string | undefined,
		target: TreeNode | undefined
	): Promise<void> {
		const draggedIndex = todos.findIndex((todo) => todo.id === draggedId);
		if (draggedIndex < 0) {
			return;
		}
		const [dragged] = todos.splice(draggedIndex, 1);
		let insertIndex = todos.length;
		if (target && target.kind === 'todo') {
			insertIndex = todos.findIndex((todo) => todo.id === target.todo.id);
			if (insertIndex < 0) {
				insertIndex = todos.length;
			}
		} else if (target && target.kind === 'workspace') {
			insertIndex = todos.length;
		}
		todos.splice(insertIndex, 0, dragged);
		const now = new Date().toISOString();
		todos.forEach((todo, index) => {
			todo.position = index + 1;
			if (todo.id === dragged.id) {
				todo.updatedAt = now;
			}
		});

		if (this.mode === 'global') {
			await this.repository.saveGlobalTodos(todos);
		} else if (workspaceFolder) {
			await this.repository.saveWorkspaceTodos(workspaceFolder, todos);
		}
		this.provider.refresh();
	}

	dispose(): void {
		// No-op
	}
}

export function getWorkspaceFolderKey(folder: vscode.WorkspaceFolder): string {
	return folder.uri.toString();
}
