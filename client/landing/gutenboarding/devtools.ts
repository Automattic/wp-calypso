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
				for ( const [ actionName, actionFn ] of Object.entries(
					window.wp.data.dispatch( AUTH_STORE )
				) ) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					window.wp.auth[ actionName ] = async ( ...args: any[] ) => {
						await ( actionFn as any )( ...args ); // eslint-disable-line @typescript-eslint/no-explicit-any
						const loginFlowState = window.wp?.data.select( AUTH_STORE ).getLoginFlowState();
						console.log( 'New loginFlowState =', loginFlowState ); // eslint-disable-line no-console
					};
				}
			}
		}
	}
};
