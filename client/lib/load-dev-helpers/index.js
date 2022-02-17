import config from '@automattic/calypso-config';

export default function loadDevHelpers( reduxStore ) {
	if ( config.isEnabled( 'dev/auth-helper' ) ) {
		const el = document.querySelector( '.environment.is-auth' );
		if ( el ) {
			asyncRequire( 'calypso/lib/auth-helper', ( helper ) => helper( el ) );
		}
	}

	// preferences helper requires a Redux store to read and write preferences, and can't
	// be rendered in environments that don't have a Redux store, like Gutenboarding.
	if ( reduxStore && config.isEnabled( 'dev/preferences-helper' ) ) {
		const el = document.querySelector( '.environment.is-prefs' );
		if ( el ) {
			asyncRequire( 'calypso/lib/preferences-helper', ( helper ) => helper( el, reduxStore ) );
		}
	}

	if ( config.isEnabled( 'dev/features-helper' ) ) {
		const el = document.querySelector( '.environment.is-features' );
		if ( el ) {
			asyncRequire( 'calypso/lib/features-helper', ( helper ) => helper( el ) );
		}
	}
}
