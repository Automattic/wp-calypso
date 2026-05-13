import { persistQueryClientPromise } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { captureException, initSentry } from '@automattic/calypso-sentry';
import {
	isSupportSession,
	maybeInitializeSupportSession,
} from '@automattic/calypso-support-session';
import { createRoot } from 'react-dom/client';
import '@wordpress/components/build-style/style.css';
import '@wordpress/commands/build-style/style.css';
import loadDevHelpers from 'calypso/lib/load-dev-helpers';
import wpcom from 'calypso/lib/wp';
import isDashboardEnv from '../utils/is-dashboard-env';
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

	if ( ! isDashboardEnv() && ! isEnabled( 'dashboard/v2' ) && ! isSupportSession() ) {
		throw new Error( 'Multi-site Dashboard is not enabled' );
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
	} else if ( isEnabled( 'dashboard/omnibar' ) ) {
		import( './interim-omnibar' )
			.then( ( m ) => m.default( omnibarEvents ) )
			.catch( captureException );
	}

	persistQueryClientPromise.then( () => {
		root.render( <Layout config={ config } /> );
	} );
}

export default boot;
