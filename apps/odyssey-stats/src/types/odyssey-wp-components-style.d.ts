/**
 * Alias defined in webpack.config.js pointing at `@wordpress/components`' base stylesheet, imported
 * for its side effect by `lib/load-wp-components-style.ts`. Declared here because TypeScript
 * resolves module specifiers through tsconfig, not through webpack's `resolve.alias`.
 */
declare module 'odyssey-wp-components-style';
