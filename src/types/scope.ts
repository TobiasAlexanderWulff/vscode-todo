export type ScopeTarget = { scope: 'global' } | { scope: 'workspace'; workspaceFolder: string };

export type TodoTarget =
	| { todoId: string; scope: 'global' }
	| { todoId: string; scope: 'workspace'; workspaceFolder: string };
