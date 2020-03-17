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

				const config = require( 'config' ).default;
				const clientCreds = {
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
				};

				const { Auth, Site } = require( '@automattic/data-stores' );
				const AUTH_STORE = Auth.register( clientCreds );
				Site.register( clientCreds );

				window.wp.auth = {};
				let previousState = window.wp?.data.select( AUTH_STORE ).getLoginFlowState();
				let previousErrors = window.wp?.data.select( AUTH_STORE ).getErrors();
				window.wp?.data.subscribe( () => {
					const newState = window.wp?.data.select( AUTH_STORE ).getLoginFlowState();
					const newErrors = window.wp?.data.select( AUTH_STORE ).getErrors();
					if (
						previousState !== newState ||
						JSON.stringify( previousErrors ) !== JSON.stringify( newErrors )
					) {
						console.log( 'New loginFlowState =', newState );
						if ( newErrors.length ) {
							console.log( 'Errors =', JSON.stringify( newErrors, null, 2 ) );
						} else {
							console.log( 'No Errors!' );
						}
						previousState = newState;
						previousErrors = newErrors;
					}
				} );
				for ( const [ actionName, actionFn ] of Object.entries(
					window.wp.data.dispatch( AUTH_STORE )
				) ) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					window.wp.auth[ actionName ] = ( ...args: any[] ) => ( actionFn as any )( ...args );
				}
			}
		}
	}
};
