# Changelog

## trunk

- Dropped Babel presets. They have been moved to `@automattic/calypso-babel-config`. The new packge should be a drop in replacement, anywhere you were using `@automattic/calypso-build/babel/dependencies` you can use `@automattic/calypso-babel-config/presets/dependencies` (same for the other presets)
- Dropped Jest presets. They have been moved to `@automattic/calypso-jest`. . The new packge should be a drop in replacement, you can use `preset: @automattic/calypso-jest` in your Jest config.
- Added `build-app-languages` command that takes a `pot` file and builds translations file off of it based on `https://widgets.wp.com/languages/calypso`.
- Updated dependencies:
  - postcss-custom-properties to ^12.0.0

## 10.0.0

- Dropped `cache-loader`, as it is not compatible with Webpack 5.
- Dropped `cacheDirectory` option in Sass loader
- Updated dependencies:
  - sass to ^1.37.5
  - sass-loader to ^12.1.0
  - postcss-loader to ^6.2.0
  - postcss peer requirement to ^8.3.11
  - @automattic/webpack-rtl-plugin to ^5.1.0
- Set `quietDeps: true` in dart sass options. This avoids printing deprecation
  warnings for stylesheets imported from node_modules.
- Stopped defaulting `publicPath` option to `/` in `webpack/file-loader`, using the global default that treats paths as relative to the importing script URL.
- Fixed an issue where the default calypso-build PostCSS config was not being resolved. PostCSS will now process CSS files using a default config file if you do not specify your own config file. This was previously broken. ([More info here](https://github.com/Automattic/wp-calypso/pull/56600).)

## 9.0.0

- Added new, extensible TypeScript config for modern TS and JS packages in `./typescript/[tj]-package.json`
- Breaking: Changed `webpack/file-loader` to internally use the new `asset/resource` modules (the former is deprecated in
  webpack 5). The semantics of the options have changed, now the final asset URL is `${publichPath}${outputPath}/${fileName}`,
  before it didn't include the `outputPath` part.
- Switched from `node-sass` to `sass` (Dart Sass) for processing Sass files:
- Removed dependencies:
  - node-sass
  - file-loader
- Added dependencies:
  - sass ^1.32.13
- Updated dependencies:
  - @babel/cli to ^7.14.8
  - @babel/compat-data to ^7.14.7
  - @babel/core to ^7.14.8
  - @babel/helpers to ^7.14.8
  - @babel/plugin-proposal-class-properties to ^7.14.5
  - @babel/plugin-transform-react-jsx to ^7.14.5
  - @babel/plugin-transform-runtime to ^7.14.5
  - @babel/preset-env to ^7.14.8
  - @babel/preset-react to ^7.14.5
  - @babel/preset-typescript to ^7.14.5
  - @types/webpack-env to ^1.16.2
  - @wordpress/babel-plugin-import-jsx-pragma to ^3.0.3
  - @wordpress/browserslist-config to ^3.0.3
  - @wordpress/dependency-extraction-webpack-plugin to ^3.1.2
  - autoprefixer to ^10.2.5
  - babel-jest to ^27.0.6
  - css-loader to ^5.2.4
  - jest-config to ^27.0.6
  - mini-css-extract-plugin to ^1.6.0
  - postcss-loader to ^5.3.0
  - sass to ^1.32.13
  - sass-loader to ^11.1.1
  - thread-loader to ^3.0.4
  - typescript to ^4.3.5
  - webpack-cli to ^4.7.2
- Updated peer dependencies:
  - jest to >=27.0.6
  - postcss to ^8.2.15
  - webpack to ^5.46.0

## 8.0.0

- Breaking: Drop option `postCssConfig` for Sass loader. The property `postCssOptions` will be passed as is
  to `postcss-loader`. See the doc in <https://github.com/webpack-contrib/postcss-loader#postcssoptions>
- Breaking: `calypso-build`, `transpile` and `webpack/minify` won't set `defaults` as browserslist environment anymore.
  Instead they will fallback to the [default resolution methods from browserslist](https://github.com/browserslist/browserslist#queries)
- Breaking: `webpack/minify` API has changed. Now it only accepts 4 options: `terserOptions`, `cssMinimizerOptions`, `parallel` and `extractComments`.
- Added: `webpack/minify` will use CssMinimizerWebpackPlugin to minimize CSS files.
- Added: option `cacheCompression` to toggle babel cache compression
- Added: option `bugfixes` for `calypso-build/babel/default` preset to toggle <https://babeljs.io/docs/en/babel-preset-env#bugfixes>
- Added dependencies:
  - css-minimizer-webpack-plugin ^1.3.0
  - postcss ^8.2.6 (peer dependency)
- Updated dependencies:
  - postcss-custom-properties to ^11.0.0
  - postcss-loader to ^5.0.0
  - @automattic/webpack-rtl-plugin to ^5.0.0

## 7.0.0

- Breaking: drop support for wepback 4
- Breaking: renamed option `output-jsonp-function` to `output-chunk-loading-global`
- Changed: Use `contenthash` hash strategy instead of `chunkhash`
- Added: support for webpack 5
- Added: plugin to transform i18n imports to local variables
- Updated dependencies
  - @wordpress/dependency-extraction-webpack-plugin to ^2.9.0

## 6.5.0

- Added `corejs`, `debug`, and `useBuiltIns` options to the `babel/default` preset.

## 6.4.0

- Added `--esm` and `--cjs` options to `copy-assets` and `transpile` to do only one kind of
  the build (ESM or CJS) instead of both that are done by default
- Add more target ECMAScript versions to Terser config and switch dependencies
- Migrated from `webpack-rtl-plugin` to `@automattic/webpack-rtl-plugin`.
- Added `calypso:src` as a field used to resolve modules.
- Updated dependencies
  - @babel/cli to ^7.12.1
  - @babel/core to ^7.12.3
  - @babel/helpers to ^7.12.5
  - @babel/plugin-proposal-class-properties to ^7.12.1
  - @babel/plugin-transform-react-jsx to ^7.12.5
  - @babel/plugin-transform-runtime to ^7.12.1
  - @babel/preset-env to ^7.12.1
  - @babel/preset-react to ^7.12.5
  - @babel/preset-typescript to ^7.12.1
  - typescript to ^4.0.3
  - terser-webpack-plugin to "4.2.2
- Do not mangle functions called '\_\_', '\_n', '\_nx' or '\_x' (used for extracting translations)
- Removed the exceptions for the `import/no-extraneous-dependencies` eslint rule for `*.md.jsx` and `*.md.js` files
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
