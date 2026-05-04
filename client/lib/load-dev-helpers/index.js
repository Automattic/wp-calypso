import config from '@automattic/calypso-config';
import { debounce } from '@wordpress/compose';

export default function loadDevHelpers( reduxStore ) {
	const badge = document.querySelector( '.environment-badge' );
	if ( badge ) {
		// goofy import for environment badge, which is SSR'd
		import(
			/* webpackChunkName: "async-load-calypso-components-environment-badge-style" */ 'calypso/components/environment-badge/style.scss'
		);

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
			import(
				/* webpackChunkName: "async-load-calypso-lib-account-settings-helper" */ 'calypso/lib/account-settings-helper'
			).then( ( helper ) => helper.default( el, reduxStore ) );
		}
	}

	if ( config.isEnabled( 'dev/auth-helper' ) ) {
		const el = document.querySelector( '.environment.is-auth' );
		if ( el ) {
			import(
				/* webpackChunkName: "async-load-calypso-lib-auth-helper" */ 'calypso/lib/auth-helper'
			).then( ( helper ) => helper.default( el ) );
		}
	}

	// preferences helper requires a Redux store to read and write preferences, and can't
	// be rendered in environments that don't have a Redux store, like Gutenboarding.
	if ( reduxStore && config.isEnabled( 'dev/preferences-helper' ) ) {
		const el = document.querySelector( '.environment.is-prefs' );
		if ( el ) {
			import(
				/* webpackChunkName: "async-load-calypso-lib-preferences-helper" */ 'calypso/lib/preferences-helper'
			).then( ( helper ) => helper.default( el, reduxStore ) );
		}
	}

	if ( config.isEnabled( 'dev/features-helper' ) ) {
		const el = document.querySelector( '.environment.is-features' );
		if ( el ) {
			import(
				/* webpackChunkName: "async-load-calypso-lib-features-helper" */ 'calypso/lib/features-helper'
			).then( ( helper ) => helper.default( el ) );
		}
	}

	if ( config.isEnabled( 'dev/react-query-devtools' ) ) {
		const el = document.querySelector( '.environment.is-react-query-devtools' );
		if ( el ) {
			import(
				/* webpackChunkName: "async-load-calypso-lib-react-query-devtools-helper" */ 'calypso/lib/react-query-devtools-helper'
			).then( ( helper ) => helper.default( el ) );
		}
	}

	if ( config.isEnabled( 'dev/store-sandbox-helper' ) ) {
		const el = document.querySelector( '.environment.is-store-sandbox' );
		if ( el ) {
			import(
				/* webpackChunkName: "async-load-calypso-lib-store-sandbox-helper" */ 'calypso/lib/store-sandbox-helper'
			).then( ( helper ) => helper.default( el ) );
		}
	}

	if ( config.isEnabled( 'dark-mode' ) ) {
		const el = document.querySelector( '.environment.is-dark-mode' );
		if ( el ) {
			import(
				/* webpackChunkName: "async-load-calypso-lib-dark-mode-helper" */ 'calypso/lib/dark-mode-helper'
			).then( ( helper ) => helper.default( el ) );
		}
	}
}
