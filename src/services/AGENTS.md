# Directory AGENTS — src/services

- No UI or VS Code API usage; services are pure logic/stateful utilities over domain types.
- Consume config via injection (e.g., from `src/adapters/config.ts`), not by reading VS Code configuration.
- Keep dependencies to domain/types only; do not import adapters or composition.
- Maintain strict typing and avoid side effects beyond defined responsibilities (repo persistence, undo, auto-delete).
