# Changelog

## 1.0.6

- Publish against `@automattic/ui@^2.0.0`, resolving a duplicate/mismatched `@automattic/ui` version in the installed dependency tree (previously published `1.0.4` pinned `@automattic/ui@^1.0.3`).

## 1.0.5

- Packaging: declare `sass` as a runtime dependency for the package build script.

## 1.0.4

- Declare React 19 compatibility for package consumers (#111721).

## 1.0.3

- Fix: restore `*.scss` in `sideEffects` so Calypso (which consumes the package via `calypso:src`) doesn't tree-shake the `import './style.scss'` and lose all of the picker's styles.

## 1.0.2

- Packaging: pre-compile SCSS to CSS in `dist/{esm,cjs}/style.css` so external consumers no longer need a Sass loader. SCSS variables from `@wordpress/base-styles` are resolved at build time.
- Packaging: move `@wordpress/components`, `@wordpress/compose`, `@wordpress/date`, `@wordpress/i18n`, and `@wordpress/icons` to `peerDependencies` (with `>=` ranges) to prevent duplicate installs and to accommodate hosts pinned to newer `@wordpress/*` majors.
- Packaging: stop shipping `src/test/**` and `dist/*.tsbuildinfo` in the published tarball.
- Packaging: drop unused `tslib` runtime dependency.
- Styles: add sensible fallbacks (`#fff`, `#1e1e1e`, `#949494`) to the dashboard CSS custom properties so the picker renders correctly outside the Calypso dashboard shell.
- Docs: add a "Using outside Calypso" section to the README documenting peer-deps, the required `@automattic/ui/style.css` import, and the themable CSS custom properties.

## 1.0.1

- Fix packaging: include `style.scss` in `dist/esm/` and `dist/cjs/` so the compiled `import './style.scss'` resolves for consumers that don't use the `calypso:src` exports condition.

## 1.0.0

- Initial release ([#110712](https://github.com/Automattic/wp-calypso/pull/110712))
