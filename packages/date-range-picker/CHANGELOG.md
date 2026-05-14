# Changelog

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
