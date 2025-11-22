# Directory AGENTS — src

- Follow layered architecture from `docs/ARCHITECTURE.md`: domain → services → adapters → composition (`extension.ts`); do not import higher layers from lower ones.
- Keep VS Code API usage out of domain/services; only adapters/composition may use it.
- Read settings via `src/adapters/config.ts` and inject into services; do not access `vscode.workspace.getConfiguration` directly here.
- Use boundary lint rules (`npm run lint -- --max-warnings=0`) to guard imports; fix violations before committing.
