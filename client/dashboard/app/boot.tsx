import { persistQueryClientPromise } from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import {
	isSupportSession,
	maybeInitializeSupportSession,
} from '@automattic/calypso-support-session';
import { createRoot } from 'react-dom/client';
import '@wordpress/components/build-style/style.css';
import '@wordpress/commands/build-style/style.css';
import loadDevHelpers from 'calypso/lib/load-dev-helpers';
import wpcom from 'calypso/lib/wp';
import isDashboard from '../utils/is-dashboard';
import { loadPreferencesHelper } from './dev-tools/preferences';
import Layout from './layout';
import limitTotalSnackbars from './snackbars/limit-total-snackbars';
import type { AppConfig } from './context';

import './style.scss';

function boot( config: AppConfig ) {
	if ( ! isDashboard() && ! isEnabled( 'dashboard/v2' ) && ! isSupportSession() ) {
		throw new Error( 'Multi-site Dashboard is not enabled' );
	}

	maybeInitializeSupportSession( wpcom );
	loadDevHelpers();
	loadPreferencesHelper();
	limitTotalSnackbars();

	const rootElement = document.getElementById( 'wpcom' );
	if ( rootElement === null ) {
		throw new Error( 'No root element found' );
	}
	const root = createRoot( rootElement );

	persistQueryClientPromise.then( () => {
		root.render( <Layout config={ config } /> );
	} );
}

export default boot;
