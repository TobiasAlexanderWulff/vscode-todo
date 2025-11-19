# Vision

## Context
- We are building a VS Code extension scaffoled via `npm init @vscode`.
- The extension should make it effortless to track TODO items without leaving the editor.
- VS Code already provides profile-aware global storage and workspace-aware storage that we can leverage.

## High-level Goal
Create a lightweight TODO manager baked into the VS Code UI with two complementary scopes:
1. **Global (profile-bound)** — personal todos that follow the user across every workspace within the active VS Code profile.
2. **Project (workspace-bound)** — todos that live with the current project and are shared with the team whenever the workspace is opened.

Both scopes should be visible side-by-side in the Explorer view (e.g., via a `TreeView`) so users can see the full picture of their tasks at a glance.

## Core Capabilities
- Add, edit, complete, and delete todos within either scope.
- Quickly move items between global and project scopes where it makes sense.
- Persist todos automatically using the storage that VS Code exposes through `ExtensionContext` (`globalState` for profile data, `workspaceState` for project data).
- Provide a clean command palette and context-menu workflow (e.g., `todo.addGlobal`, `todo.addProject`, `todo.complete`, `todo.moveToProject`).
- Keep the TreeView in sync with storage so changes are reflected immediately.

## Experience Principles
- **Zero setup** — the extension should work out of the box once installed; no external services or manual configuration.
- **Stay in flow** — todo capture must be frictionless (simple input boxes, keyboard friendly commands).
- **Keep context visible** — it should be obvious whether an item lives in the global list or the project list.
- **Profile aware** — switching VS Code profiles should automatically switch the global todo set with no additional work.

## Rough Implementation Direction
1. Scaffold the project with `npm init @vscode` (TypeScript template).
2. Implement a `TodoRepository` abstraction that wraps `globalState`/`workspaceState`.
3. Build a `TreeDataProvider` with two collapsible root nodes (“Global” and “Project”) and dynamic children.
4. Wire extension commands to mutate the repository and refresh the tree.
5. Add light persistence tests (where feasible) and validation around data migration/versioning.

## Known Non-Goals (for now)
- Syncing beyond the user’s VS Code profile (e.g., cloud sync).
- Rich task metadata (due dates, tags, priorities) beyond a simple title + completion state.
- Automatic parsing of TODO comments from source files.
