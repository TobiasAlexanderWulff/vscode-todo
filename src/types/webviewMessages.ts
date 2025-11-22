import { ProviderMode, WebviewScope } from '../todoWebviewHost';

export type { WebviewScope };

// Outbound from extension → webview
export type StateUpdateMessage = { type: 'stateUpdate'; payload: unknown };
export type StartInlineCreateMessage = { type: 'startInlineCreate'; scope: WebviewScope };
export type StartInlineEditMessage = { type: 'startInlineEdit'; scope: WebviewScope; todoId: string };
export type AutoDeleteCueMessage = {
	type: 'autoDeleteCue';
	scope: WebviewScope;
	todoId: string;
	durationMs: number;
};

export type OutboundMessage =
	| StateUpdateMessage
	| StartInlineCreateMessage
	| StartInlineEditMessage
	| AutoDeleteCueMessage;

// Inbound from webview → extension
export type WebviewReadyMessage = { type: 'webviewReady'; mode: ProviderMode };
export type CommitCreateMessage = { type: 'commitCreate'; scope: WebviewScope; title: string };
export type CommitEditMessage = {
	type: 'commitEdit';
	scope: WebviewScope;
	todoId: string;
	title: string;
};
export type ToggleCompleteMessage = { type: 'toggleComplete'; scope: WebviewScope; todoId: string };
export type RemoveTodoMessage = { type: 'removeTodo'; scope: WebviewScope; todoId: string };
export type ReorderTodosMessage = { type: 'reorderTodos'; scope: WebviewScope; order: string[] };
export type ClearScopeMessage = { type: 'clearScope'; scope: WebviewScope };

export type InboundMessage =
	| WebviewReadyMessage
	| CommitCreateMessage
	| CommitEditMessage
	| ToggleCompleteMessage
	| RemoveTodoMessage
	| ReorderTodosMessage
	| ClearScopeMessage;

export type WebviewMessageEvent = { mode: ProviderMode; message: InboundMessage };
