import * as vscode from 'vscode';

type ProviderMode = 'global' | 'projects';

export class TodoWebviewHost implements vscode.Disposable {
	private readonly disposables: vscode.Disposable[] = [];
	private readonly providers: TodoWebviewProvider[];

	constructor(private readonly context: vscode.ExtensionContext) {
		this.providers = [
			new TodoWebviewProvider(context.extensionUri, 'todoGlobalView', 'global'),
			new TodoWebviewProvider(context.extensionUri, 'todoProjectsView', 'projects'),
		];
		this.providers.forEach((provider) => {
			this.disposables.push(
				vscode.window.registerWebviewViewProvider(provider.viewId, provider, {
					webviewOptions: { retainContextWhenHidden: true },
				})
			);
		});
	}

	dispose(): void {
		this.providers.forEach((provider) => provider.dispose());
		this.disposables.forEach((disposable) => disposable.dispose());
	}
}

class TodoWebviewProvider implements vscode.WebviewViewProvider, vscode.Disposable {
	private webviewView: vscode.WebviewView | undefined;

	constructor(
		private readonly extensionUri: vscode.Uri,
		readonly viewId: string,
		private readonly mode: ProviderMode
	) {}

	resolveWebviewView(webviewView: vscode.WebviewView): void {
		this.webviewView = webviewView;
		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media')],
		};
		webviewView.webview.html = this.buildHtml(webviewView.webview);
	}

	dispose(): void {
		this.webviewView = undefined;
	}

	private buildHtml(webview: vscode.Webview): string {
		const nonce = getNonce();
		const csp = [
			"default-src 'none';",
			`img-src ${webview.cspSource} https:;`,
			`style-src 'unsafe-inline' ${webview.cspSource};`,
			`script-src 'nonce-${nonce}';`,
		].join(' ');
		return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta http-equiv="Content-Security-Policy" content="${csp}" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>TODOs</title>
	</head>
	<body>
		<main id="root" data-mode="${this.mode}">
			<p>TODO webview placeholder (${this.mode}).</p>
		</main>
		<script nonce="${nonce}">
			(function () {
				const vscode = acquireVsCodeApi();
				vscode.postMessage({ type: 'webviewReady', mode: '${this.mode}' });
			})();
		</script>
	</body>
</html>`;
	}
}

function getNonce(): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let nonce = '';
	for (let i = 0; i < 32; i += 1) {
		const randomIndex = Math.floor(Math.random() * characters.length);
		nonce += characters.charAt(randomIndex);
	}
	return nonce;
}
