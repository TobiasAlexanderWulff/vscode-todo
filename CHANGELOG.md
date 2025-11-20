# Change Log

All notable changes to the "vscode-todo" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

### Changed
- Added repository metadata and MIT license for marketplace packaging.

## [0.1.0] - 2025-11-20

### Changed
- Streamlined webview UI by removing redundant Global/Projects section headers and counts inside each view; toolbar buttons remain for add/clear actions.
- Fixed localization gaps for the Projects view and pruned unused count strings from the bundles.
- Refreshed README copy for marketplace readiness.

### Added
- Phase 1 foundation: removed scaffold command, registered real TODO commands and keybindings, and documented the product vision in `docs/vision.md`.
- Localization bootstrap with `@vscode/l10n` plus English/German bundles for runtime strings and `package.nls.*.json`.
- Implemented the `TodoRepository` with scoped persistence (profile/workspace), undo snapshots, and position metadata. Added the `todo.confirmDestructiveActions` setting.
- Updated developer docs (`README.md`, `docs/implementation-plan.md`, `AGENTS.md`) to describe workflows and the implementation roadmap.
- Phase 2 features: dedicated Activity Bar container with Global/Project TODO views, drag-and-drop reordering, scope-aware commands (add/edit/complete/remove/clear) with confirmation + undo flows, and end-to-end localization of runtime prompts.
- Expanded test coverage: inline command flow uses webview inline edits, reorder and clear/undo paths are covered, and multi-root command selection is validated. Updated agent guidance on commits, branching, and push responsibility.
