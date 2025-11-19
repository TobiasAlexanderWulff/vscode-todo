const esbuild = require('esbuild');

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @param {string} label
 * @returns {import('esbuild').Plugin}
 */
const createProblemMatcherPlugin = (label) => ({
	name: `esbuild-problem-matcher-${label}`,

	setup(build) {
		build.onStart(() => {
			console.log(`[${label}] build started`);
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log(`[${label}] build finished`);
		});
	},
});

async function createContext(config) {
	const ctx = await esbuild.context(config);
	return ctx;
}

async function main() {
	const extensionConfig = {
		entryPoints: ['src/extension.ts'],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		target: 'node18',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [createProblemMatcherPlugin('extension')],
	};

	const webviewConfig = {
		entryPoints: ['src/webview/main.ts'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		target: 'es2019',
		outfile: 'media/webview.js',
		logLevel: 'silent',
		plugins: [createProblemMatcherPlugin('webview')],
	};

	const [extensionCtx, webviewCtx] = await Promise.all([
		createContext(extensionConfig),
		createContext(webviewConfig),
	]);

	if (watch) {
		await Promise.all([extensionCtx.watch(), webviewCtx.watch()]);
	} else {
		await Promise.all([extensionCtx.rebuild(), webviewCtx.rebuild()]);
		await Promise.all([extensionCtx.dispose(), webviewCtx.dispose()]);
	}
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
