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

export const NO__ = ( value: string ) => value;

export const NO_n = ( single: string, plural: string, number: number ) =>
	number > 1 ? plural : single;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const NO_nx = ( single: string, plural: string, number: number, context: string ) =>
	NO_n( single, plural, number );

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const NO_x = ( value: string, context: string ) => value;
