import { isEnabled } from '@automattic/calypso-config';
import { createRoot } from 'react-dom/client';
import '@wordpress/components/build-style/style.css';
import '@wordpress/commands/build-style/style.css';
import { isSupportSession, maybeInitializeSupportSession } from './auth/support-session';
import Layout from './layout';
import { persistPromise } from './query-client';
import type { AppConfig } from './context';
import './style.scss';

function boot( config: AppConfig ) {
	if ( ! isEnabled( 'dashboard/v2' ) && ! isSupportSession() ) {
		throw new Error( 'Dashboard v2 is not enabled' );
	}

	maybeInitializeSupportSession();

	const rootElement = document.getElementById( 'wpcom' );
	if ( rootElement === null ) {
		throw new Error( 'No root element found' );
	}
	const root = createRoot( rootElement );

	persistPromise.then( () => {
		root.render( <Layout config={ config } /> );
	} );
}

export default boot;
