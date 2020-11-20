# Changelog

## trunk (6.5.0)

- Added `--esm` and `--cjs` options to `copy-assets` and `transpile` to do only one kind of
  the build (ESM or CJS) instead of both that are done by default

## 6.4.0

- Removed the exceptions for the `import/no-extraneous-dependencies` eslint rule for `*.md.jsx` and `*.md.js` files
- Upgraded dependencies
  - typescript to ^4.0.3
  - terser-webpack-plugin to "4.2.2
- Adds option to customize the [`output.jsonpFunction` setting for webpack](https://v4.webpack.js.org/configuration/output/#outputjsonpfunction)

## 6.3.0

- Add new `postCssOptions` option for the SASS loader, allowing more powerful customization of the
  PostCSS loader, deprecating the less capable `postCssConfig` option
- Updated terser-webpack-plugin to ^4.1.0
- Added packages to the list of transpiled NPM dependencies:
  - dom7
  - query-string
  - split-on-first
  - strict-uri-encode
  - swiper
  - calypso
- Removed packages to the list of transpiled NPM dependencies:
  - wp-calypso-client

## 6.2.0

- Set `strictExportPresence` in webpack so missing exports error the build.
  See [#43619](https://github.com/Automattic/wp-calypso/pull/43619).
- Enable ES2017 syntax support in Terser output.
- Change documentation to use `yarn` instead of `npm`
- Lint files with wp-prettier:2.0.5
- Use `cache-loader` for Sass (optional)
- Updated a number of dependencies
  - @automattic/mini-css-extract-plugin-with-rtl to ^0.8.0,
  - @babel/cli to ^7.10.5,
  - @babel/core to ^7.11.1,
  - @babel/plugin-proposal-class-properties to ^7.10.4,
  - @babel/plugin-transform-react-jsx to ^7.10.4,
  - @babel/plugin-transform-runtime to ^7.11.0,
  - @babel/preset-env to ^7.11.0,
  - @babel/preset-react to ^7.10.4,
  - @babel/preset-typescript to ^7.10.4,
  - @types/webpack-env to ^1.15.2,
  - @wordpress/babel-plugin-import-jsx-pragma to ^2.7.0,
  - @wordpress/browserslist-config to ^2.7.0,
  - @wordpress/dependency-extraction-webpack-plugin to ^2.8.0,
  - autoprefixer to ^9.7.3,
  - babel-jest to ^26.3.0,
  - babel-loader to ^8.1.0,
  - cache-loader to ^4.1.0,
  - css-loader to ^3.4.2,
  - duplicate-package-checker-webpack-plugin to ^3.0.0,
  - enzyme-adapter-react-16 to ^1.15.1,
  - enzyme-to-json to ^3.4.3,
  - file-loader to ^4.3.0,
  - jest-config to ^26.4.0,
  - jest-enzyme to ^7.1.2,
  - node-sass to ^4.13.0,
  - postcss-custom-properties to ^9.1.1,
  - postcss-loader to ^3.0.0,
  - recursive-copy to ^2.0.10,
  - sass-loader to ^8.0.0,
  - terser-webpack-plugin to ^3.0.1,
  - thread-loader to ^2.1.3,
  - typescript to ^3.9.7,
  - webpack to ^4.44.1,
  - webpack-cli to ^3.3.11,
  - webpack-rtl-plugin to ^2.0.0
- Added new dependencies
  - @babel/helpers (^7.10.4)
  - cache-loader (^4.1.0)
- Added peerDependencies
  - enzyme (^3.11.0)
  - jest (>=26.4.0)
  - react (^16.0.0)
  - react-dom (^16.0.0
- Added packages to transpile:
  - @automattic/lasagna
  - gridicons
  - wp-calypso-client

## 6.1.0

- Upgrade [mini-css-extract-plugin-with-rtl](https://github.com/Automattic/mini-css-extract-plugin-with-rtl) to 0.8.0, use an npm-published version instead of GitHub branch reference
- Disable Terser's `extractComments` option to prevent Calypso build from adding LICENSE files into the minified output

## 6.0.0

- Breaking Change: Replace `copy-styles` with a generic `copy-assets` script to handle both styles and images.
- Upgrade to [sass-loader@8](https://github.com/webpack-contrib/sass-loader/releases/tag/v8.0.0)
- Add basic TypeScript config, `tsconfig.json` (for projects to extend).
- Add support for transpiling selected NPM dependencies from ESnext to the target's ES version.
- Add `punycode` to the list of transpiled NPM dependencies.

## 5.1.0

- Add `util.IncrementalProgressPlugin` to show incremental build progress
- Add support for [optional chaining](https://github.com/tc39/proposal-optional-chaining).
- Add support for [nullish coalescing](https://github.com/tc39/proposal-nullish-coalescing).

## 5.0.1

- Fix PostCSS config path default.

## 5.0.0

- Remove `@automattic/calypso-color-schemes` dependency
  - See the [example in the README](./README.md#advanced-usage-use-own-postcss-config) for instructions on how to continue to use color definitions from that file in your project.
- Remove `calypso-color-schemes` Sass Prelude.
  - Remove the `calypso-color-schemes` colors prelude from the default webpack config.
    This was useful when the colors were defined as SCSS variables, but now when they are
    defined as CSS variables included in the CSS output, the prelude no longer makes sense.
- Use Consumer's `postcss.config.js`, if present.
- Remove `preserveCssCustomProperties` option from SASS preset; default to `true`.
- Add `postCssConfig` options to SASS preset to enable customization of PostCSS options.

## 4.2.1

- Fix a bad file: dependency in the published package.

## 4.2.0

- Update a number of dependencies
  - @babel/core@7.6.4
  - @babel/preset-env@7.6.3
  - @babel/preset-react@7.6.3
  - autoprefixer@9.7.0
  - browserlist@4.7.2
  - enzyme-adapter-react-16@1.15.1
  - enzyme-to-json@3.4.3
  - node-sass@4.13.0 to get Node@12 support
  - postcss-custom-properties@8.0.11
  - sass-loader@7.3.1
  - thread-loader@2.1.3
  - typescript@3.6.4
  - webpack@4.41.2
  - webpack-cli@3.3.9
  - webpack-rtl-plugin@1.8.2
- Support CommonJS/ESM compilation by adding a `modules` option (and `MODULES` env variable) to the `babel/default` preset.
- Add `jest-enzyme` assertion library to `jest-preset.js`.

## 4.1.0

- Add config options to file-loader.
- Add `enzyme-to-json` serializer to `jest-preset.js`.
- Make Jest ignore transpiled files in `dist/`.
- Handle `TypeScript` files in `transpile` command.
- Use `require.resolve` to resolve babel plugins and presets.

## 4.0.1

- Replace esm import/export with `require`.

## 4.0.0

- Move `jest.config.js` to `jest-preset.js` so it can be used as a jest preset.
- Add jest babel transform to load calypso-build babel configuration.
- Reorganize jest transforms under `@automattic/calypso-build/jest/transform/`.
- Added transform-runtime versioning to babel/default.js
  This will need to be kept up to date while <https://github.com/babel/babel/issues/10261> is unresolved.

## 3.0.0

- Switch to `@wordpress/dependency-extraction-webpack-plugin` from
  `@automattic/wordpress-external-dependencies-plugin` for WordPress webpack externals.
- Update `@wordpress/babel-plugin-import-jsx-pragma` dependency and correctly handle `<></>` via `@wordpress/element`.
- Update Jest config to be able to handle `import`s otherwise handled by Webpack's `file-loader` and `sass-loader`.
- Update Jest setup to properly initialize Enzyme's adapter.
- Fix typo that prevented the `output-library-target` argument from being passed to Webpack.

## 2.0.0

- Breaking change: Remove babel plugins incompatible with TypeScript. If your bundle continues to
  compile without error, no changes are necessary. These babel plugins were removed:

  - [`@babel/plugin-proposal-export-default-from`](https://babeljs.io/docs/en/babel-plugin-proposal-export-default-from):
    Code relying on this plugin will need to be modified for compatibility before it can be bundled
    with `calypso-build`. For example:

    ```js
    // Code relying on @babel/plugin-proposal-export-default-from
    export someExportedName from 'some-module';

    // becomes
    export { default as someExportedName } from 'some-module';
    ```

  - [`@babel/plugin-proposal-export-namespace-from`](https://babeljs.io/docs/en/babel-plugin-proposal-export-namespace-from):
    Code relying on this plugin will need to be modified for compatibility before it can be bundled
    with `calypso-build`. For example:

    ```js
    // Code relying on @babel/plugin-proposal-export-namespace-from
    export * as someExportedName from 'some-module';

    // becomes
    import * as someExportedName from 'some-module';
    export { someExportedName };
    ```

- Bugfix: Add ts and tsx extensions to webpack module resolution rules.

## 1.0.0

- Initial release
