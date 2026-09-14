// Type shims for the deep imports we reach into `@wordpress/global-styles-ui`
// via the yarn patch on its `exports` field. TypeScript's `node` module
// resolution doesn't honor subpath exports, so we redirect the deep paths to
// the package's own `build-types` declarations explicitly.

declare module '@wordpress/global-styles-ui/build-module/context' {
	export * from '@wordpress/global-styles-ui/build-types/context';
}

declare module '@wordpress/global-styles-ui/build-module/hooks' {
	export * from '@wordpress/global-styles-ui/build-types/hooks';
}
