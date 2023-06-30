import config from '@automattic/calypso-config';
import { debounce } from 'lodash';
import { createRoot } from 'react-dom/client';

export default function loadDevHelpers( reduxStore ) {
	const badge = document.querySelector( '.environment-badge' );
	if ( badge ) {
		// Show/hide Dev Tools menu as mouse enters/leaves
		const remove = debounce( () => {
			badge.classList.remove( 'hovered' );
		}, 500 );
		badge.onmouseleave = remove;

		badge.onmouseenter = () => {
			remove.cancel();
			badge.classList.add( 'hovered' );
		};
	}

	// account settings helper requires a Redux store.
	if ( reduxStore && config.isEnabled( 'dev/account-settings-helper' ) ) {
		const el = document.querySelector( '.environment.is-account-settings' );
		if ( el ) {
			const root = createRoot( el );
			asyncRequire( 'calypso/lib/account-settings-helper', ( helper ) =>
				helper( root, reduxStore )
			);
		}
	}

	if ( config.isEnabled( 'dev/auth-helper' ) ) {
		const el = document.querySelector( '.environment.is-auth' );
		if ( el ) {
			const root = createRoot( el );
			asyncRequire( 'calypso/lib/auth-helper', ( helper ) => helper( root ) );
		}
	}

	// preferences helper requires a Redux store to read and write preferences, and can't
	// be rendered in environments that don't have a Redux store, like Gutenboarding.
	if ( reduxStore && config.isEnabled( 'dev/preferences-helper' ) ) {
		const el = document.querySelector( '.environment.is-prefs' );
		if ( el ) {
			const root = createRoot( el );
			asyncRequire( 'calypso/lib/preferences-helper', ( helper ) => helper( root, reduxStore ) );
		}
	}

	if ( config.isEnabled( 'dev/features-helper' ) ) {
		const el = document.querySelector( '.environment.is-features' );
		if ( el ) {
			const root = createRoot( el );
			asyncRequire( 'calypso/lib/features-helper', ( helper ) => helper( root ) );
		}
	}

	if ( config.isEnabled( 'dev/react-query-devtools' ) ) {
		const el = document.querySelector( '.environment.is-react-query-devtools' );
		if ( el ) {
			const root = createRoot( el );
			asyncRequire( 'calypso/lib/react-query-devtools-helper', ( helper ) => helper( root ) );
		}
	}
}
