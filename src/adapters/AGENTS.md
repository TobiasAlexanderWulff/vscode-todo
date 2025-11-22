# Directory AGENTS — src/adapters

- Adapters are the only layer allowed to touch VS Code APIs; keep domain/services free of `vscode` imports.
- Use routers (`commandRouter`, `webviewRouter`) and config adapter; inject settings instead of reading workspace config elsewhere.
- Respect boundary linting: adapters may depend on domain/services/types/webview, not the other way around.
- Keep HTML/JS message contracts aligned with `webview` types; avoid business logic here beyond orchestration.
