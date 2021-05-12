/* eslint-disable no-console */

interface MagicWindow extends Window {
	wp: undefined | Record< string, any >;
}

// Don't complain about window.wp.data types in our debug function
declare const window: undefined | MagicWindow;

export const setupWpDataDebug = () => {
	if ( process.env.NODE_ENV !== 'production' ) {
		if ( typeof window === 'object' ) {
			if ( ! window.wp ) {
				window.wp = {};
			}
			if ( ! window.wp.data ) {
				window.wp.data = require( '@wordpress/data' );

				const config = require( '@automattic/calypso-config' ).default;
				const clientCreds = {
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
				};

				const { Site } = require( '@automattic/data-stores' );
				Site.register( clientCreds );
			}
		}
	}
};
