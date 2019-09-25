# 4.1.0

- Add config options to file-loader.
- Add `enzyme-to-json` serializer to `jest-preset.js`.
- Make Jest ignore transpiled files in `dist/`.
- Handle `TypeScript` files in `transpile` command.
- Use `require.resolve` to resolve babel plugins and presets.

# 4.0.1

- Replace esm import/export with `require`.

# 4.0.0

- Move `jest.config.js` to `jest-preset.js` so it can be used as a jest preset.
- Add jest babel transform to load calypso-build babel configuration.
- Reorganize jest transforms under `@automattic/calypso-build/jest/transform/`.
- Added transform-runtime versioning to babel/default.js
  This will need to be kept up to date while https://github.com/babel/babel/issues/10261 is unresolved.

# 3.0.0

- Switch to `@wordpress/dependency-extraction-webpack-plugin` from
  `@automattic/wordpress-external-dependencies-plugin` for WordPress webpack externals.
- Update `@wordpress/babel-plugin-import-jsx-pragma` dependency and correctly handle `<></>` via `@wordpress/element`.
- Update Jest config to be able to handle `import`s otherwise handled by Webpack's `file-loader` and `sass-loader`.
- Update Jest setup to properly initialize Enzyme's adapter.
- Fix typo that prevented the `output-library-target` argument from being passed to Webpack.

# 2.0.0

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

# 1.0.0

- Initial release
