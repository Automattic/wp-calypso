/* exported __webpack_public_path__ */
/* global __webpack_public_path__ */

/**
 * Dynamically set WebPack's publicPath so that split assets can be found.
 *
 * @see https://webpack.js.org/guides/public-path/#on-the-fly
 */
if ( typeof window === 'object' && window.wpcomGlobalStyles?.assetsUrl ) {
	// eslint-disable-next-line no-global-assign
	__webpack_public_path__ = window.wpcomGlobalStyles.assetsUrl;
}
