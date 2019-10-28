interface MagicWindow extends Window {
	wp: undefined | Record< string, any >;
}

// Don't complain about window.wp.data types in our debug function
declare const window: undefined | MagicWindow;

export const wpDataDebugMiddleware: PageJS.Callback = ( context, next ) => {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( typeof window === 'object' ) {
			if ( ! window.wp ) {
				window.wp = {};
			}
			if ( ! window.wp.data ) {
				window.wp.data = require( '@wordpress/data' );
			}
		}
	}
	next();
};

/**
 * Functions to use instead of `__()` etc from `@wordpress/i18n`.
 * https://developer.wordpress.org/block-editor/packages/packages-i18n/
 *
 * This is to avoid sending strings for translation tool too early.
 */
export { __ as NO__, _n as NO_n, _nx as NO_nx, _x as NO_x, sprintf } from '@wordpress/i18n';
