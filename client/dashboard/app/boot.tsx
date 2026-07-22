import { getPersistQueryClientPromise, queryClient } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { captureException, initSentry } from '@automattic/calypso-sentry';
import { maybeInitializeSupportSession } from '@automattic/calypso-support-session';
import { createRoot } from 'react-dom/client';
import '@wordpress/components/build-style/style.css';
import '@wordpress/commands/build-style/style.css';
import loadDevHelpers from 'calypso/lib/load-dev-helpers';
import wpcom from 'calypso/lib/wp';
import { AUTH_QUERY_KEY, initializeCurrentUser } from './auth';
import { handleOAuthCallback } from './auth/oauth-callback';
import { loadPreferencesHelper } from './dev-tools/preferences';
import Layout from './layout';
import { omnibarEvents } from './omnibar/events';
import limitTotalSnackbars from './snackbars/limit-total-snackbars';
import type { AppConfig } from './context';

import './style.scss';

// Masterbar CSS loaded statically so it's available for SSR (the component is server-rendered).
// eslint-disable-next-line no-restricted-imports
import 'calypso/layout/masterbar/style.scss';
import './interim-omnibar/style.scss';
import './omnibar/style.scss';
import '@automattic/omnibar/style.scss';

function boot( config: AppConfig ) {
	if ( handleOAuthCallback() ) {
		return;
	}

	maybeInitializeSupportSession( wpcom );
	loadDevHelpers();
	loadPreferencesHelper();
	limitTotalSnackbars();
	initSentry();

	const rootElement = document.getElementById( 'wpcom' );
	if ( rootElement === null ) {
		throw new Error( 'No root element found' );
	}
	const root = createRoot( rootElement );

	if ( isEnabled( 'dashboard/omnibar-radical' ) ) {
		import( './omnibar' ).then( ( m ) => m.default() ).catch( captureException );
	} else {
		import( './interim-omnibar' )
			.then( ( m ) => m.default( omnibarEvents ) )
			.catch( captureException );
	}

	initializeCurrentUser()
		.then( ( user ) => {
			// Seed the query cache with the auth query result. Avoids
			// redundant request by AuthProvider.
			queryClient.setQueryData( AUTH_QUERY_KEY, user );
			return user.ID;
		} )
		.catch( () => undefined )
		.then( ( userId ) => getPersistQueryClientPromise( userId ) )
		.then( () => {
			root.render( <Layout config={ config } /> );
		} );
}

export default boot;
