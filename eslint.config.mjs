import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';

export default [
	{
		// Ignore config files from architectural linting
		files: ['*.mjs', '*.js'],
		rules: {
			'boundaries/no-unknown-files': 'off',
			'import/no-default-export': 'off',
		},
	},
	{
		// Main source file configuration
		files: ['src/**/*.ts'],
		plugins: {
			'@typescript-eslint': typescriptEslint,
			boundaries,
			import: importPlugin,
		},

		languageOptions: {
			parser: tsParser,
			ecmaVersion: 2022,
			sourceType: 'module',
			parserOptions: {
				project: './tsconfig.json',
			},
		},

		settings: {
			'boundaries/ignore': ['**/*.test.ts', 'src/test/**', 'dist/**', 'out/**'],
			'boundaries/ignoreBuiltIn': true,
			'boundaries/elements': [
				{ type: 'domain', pattern: 'src/domain/**' },
				{ type: 'services', pattern: 'src/services/**' },
				{ type: 'adapters', pattern: 'src/adapters/**' },
				{ type: 'webview', pattern: 'src/webview/**' },
				{ type: 'composition', pattern: 'src/extension.ts' },
				{ type: 'types', pattern: 'src/types/**' },
				{ type: 'tests', pattern: 'src/test/**' },
				{ type: 'root', pattern: 'src/**' },
			],
		},

		rules: {
			'@typescript-eslint/naming-convention': [
				'warn',
				{
					selector: 'import',
					format: ['camelCase', 'PascalCase'],
				},
			],

			curly: 'warn',
			eqeqeq: 'warn',
			'no-throw-literal': 'warn',
			semi: 'warn',

			'import/no-default-export': 'error',
			'import/no-cycle': 'error',
			'import/order': 'off',
			'@typescript-eslint/no-floating-promises': 'error',
			'no-restricted-imports': 'off',
			'prefer-const': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
			],

			'boundaries/element-types': [
				'error',
				{
					default: 'disallow',
					message: 'Import violates architecture boundaries',
					rules: [
						{ from: 'adapters', allow: ['domain', 'services', 'types', 'webview'] },
						{ from: 'services', allow: ['domain', 'types'] },
						{ from: 'domain', allow: ['domain', 'types'] },
						{ from: 'webview', allow: ['types'] },
						{ from: 'types', allow: ['types'] },
						{ from: 'composition', allow: ['adapters', 'services', 'domain', 'types', 'webview'] },
						{ from: 'tests', allow: ['root'] },
					],
				},
			],
			'boundaries/no-unknown-files': 'error',
		},
	},
];
