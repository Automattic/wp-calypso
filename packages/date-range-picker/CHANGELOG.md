# Changelog

## 1.0.1

- Fix packaging: include `style.scss` in `dist/esm/` and `dist/cjs/` so the compiled `import './style.scss'` resolves for consumers that don't use the `calypso:src` exports condition.

## 1.0.0

- Initial release ([#110712](https://github.com/Automattic/wp-calypso/pull/110712))
