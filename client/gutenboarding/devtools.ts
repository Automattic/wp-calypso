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
