# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Breaking: Move to Babel 8. Requires `@babel/core` 8; the presets' Babel plugins and `@babel/runtime` are on 8. The `bugfixes` option is gone (Babel 8 always applies those fixes), and the `default` preset no longer passes `allowDeclareFields` or transform-runtime's `regenerator`, both removed in Babel 8. `@babel/preset-react` runs with `development: false`, as on Babel 7, so development builds keep importing `react/jsx-runtime` rather than `react/jsx-dev-runtime`. `@babel/preset-typescript` runs with `onlyRemoveTypeImports: false`, as on Babel 7, so imports used only as types are still removed without `import type`.
- Breaking: Remove `@emotion/babel-plugin` from the `default` preset; it doesn't run on Babel 8. Emotion component selectors (a styled component interpolated in another's styles) need that plugin, so don't use them: select with a class name or an element instead, or pass a prop. Without the plugin they throw in development and silently match `.undefined` in production. Class names also lose their development labels.
- Remove `@babel/plugin-transform-class-properties` from the `default` preset. `@babel/preset-env` already compiles class fields for targets that need it; the explicit plugin compiled them for every target, including browsers that support them natively.
- Remove the `transform-typeof-symbol` exclusion from the `default` and `dependencies` presets; none of Calypso's targets need that transform. Projects targeting browsers without `Symbol` now get it, which is correct but slower. Also drop the `dependencies` preset's `@babel/plugin-transform-runtime` options that were already its defaults.
- Breaking: Remove the `build_pot` environment, which extracted strings with `@automattic/babel-plugin-i18n-calypso`, and its `outputPOT` option, along with the dependency on that plugin. Use `@automattic/wp-babel-makepot` to extract strings. Also stop documenting the `isBrowser` option, which had no effect.
- Remove `@babel/plugin-transform-runtime` options that were already its defaults (`corejs: false`, `helpers: true`, `useESModules: false`). The output is unchanged.
- Breaking: Remove the `wordpress-element` preset and its `@wordpress/babel-plugin-import-jsx-pragma` and `@babel/plugin-transform-react-jsx` dependencies. Use the `default` preset, whose React automatic runtime matches what `@wordpress/babel-preset-default` does.
- Remove `babel-plugin-dynamic-import-node` from the `test` environment. `@babel/preset-env` already rewrites `import()` for Jest.
- Stop passing `useBuiltIns: 'entry'` and `corejs` to `@babel/preset-env` in the `default` and `dependencies` presets, and drop the `corejs` and `useBuiltIns` preset options. `core-js` entry imports are no longer replaced with the polyfills the targets need.
- Replace `@babel/plugin-proposal-class-properties` with `@babel/plugin-transform-class-properties` in the default preset
- Apply JSX syntax (`@babel/preset-react`, `@emotion/babel-plugin` and the `wordpress-element` preset's plugins) only outside `.ts` files, so `<T>value` assertions and generic arrows in them don't parse as JSX on Babel 8. `.ts` files still get preset-react's `/*#__PURE__*/` annotations for React calls, but no longer get the Emotion plugin: Emotion styled components used as component selectors (`${ Component }`) must live in `.tsx` files.
- Remove `@emotion/react` import source configuration for `@babel/preset-react` from the default preset
- Introduce `importSource` preset option and `IMPORT_SOURCE` env variable to allow configuring import source for `@babel/preset-react`
- Breaking: Stop depending on `@babel/cli` and `@babel/register`, which none of the presets use. Install them yourself if you ran the `babel` command or `@babel/register` through this package.

### Added

- Initial release
