import { ScopeTarget, TodoTarget } from '../types/scope';
import { ProviderMode, WebviewScope } from '../todoWebviewHost';

export function scopeTargetToWebviewScope(
	scope: ScopeTarget | TodoTarget
): WebviewScope | undefined {
	if (scope.scope === 'global') {
		return { scope: 'global' };
	}
	if (!scope.workspaceFolder) {
		return undefined;
	}
	return { scope: 'workspace', workspaceFolder: scope.workspaceFolder };
}

export function scopeToProviderMode(scope: ScopeTarget): ProviderMode {
	return scope.scope === 'global' ? 'global' : 'projects';
}
