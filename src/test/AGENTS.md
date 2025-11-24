# Directory AGENTS — src/test

- Prefer adapter entry points (`src/adapters/commandRouter.ts`, `src/adapters/webviewRouter.ts`) rather than `extension.ts`.
- Use shared helpers (`FakeWebviewHost`, `noopBroadcast`, `stubReadConfig`, `InMemoryMemento`) from `testUtils` to avoid bespoke stubs.
- Keep VS Code interactions mocked/stubbed; restore originals in `afterEach` to prevent bleed-over.
- Ensure boundary linting stays green; tests should not import private modules that violate the layer rules.
- Suite layout: keep repository specs in `repository.test.ts` and command/webview adapter specs in `commandRouter.test.ts`; add new specs in their own files to match the module they target.
