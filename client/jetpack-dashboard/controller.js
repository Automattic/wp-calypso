/**
 * External dependencies
 */
import React from 'react';
import ReactDom from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal Dependencies
 */
import JetpackDashboardLayout from 'layout/jetpack-dashboard';
import JetpackDashboardSecurity from './security';
import JetpackDashboardSidebar from './sidebar';
import { getCurrentUser } from 'state/current-user/selectors';
import { isEnabled } from 'config';
import {
	JETPACK_DASHBOARD_PRIMARY_DOMAIN,
	JETPACK_DASHBOARD_SECONDARY_DOMAIN,
} from 'lib/jetpack-dashboard';
import { preload } from 'sections-helper';

export const JetpackDashboardReduxWrappedLayout = ( { store, primary, secondary } ) => (
	<ReduxProvider store={ store }>
		<JetpackDashboardLayout primary={ primary } secondary={ secondary } />
	</ReduxProvider>
);

export const makeLayout = ( context, next ) => {
	const { store, primary, secondary } = context;

	// On server, only render LoggedOutLayout when logged-out.
	if ( ! context.isServerSide || ! getCurrentUser( context.store.getState() ) ) {
		context.layout = (
			<JetpackDashboardReduxWrappedLayout
				store={ store }
				primary={ primary }
				secondary={ secondary }
				redirectUri={ context.originalUrl }
			/>
		);
	}
	next();
};

export const clientRender = context => {
	ReactDom.render( context.layout, document.getElementById( 'wpcom' ) );
};

export function preloadJetpackDashboard( context, next ) {
	preload( 'jetpack-dashboard' );
	next();
}

export function handleRedirects( context, next ) {
	if ( ! isEnabled( 'jetpack-dashboard' ) ) {
		window.location = 'https://wordpress.com';
		return;
	}

	if ( window.location.host === JETPACK_DASHBOARD_SECONDARY_DOMAIN ) {
		window.location = window.location.href.replace(
			JETPACK_DASHBOARD_SECONDARY_DOMAIN,
			JETPACK_DASHBOARD_PRIMARY_DOMAIN
		);
		return;
	}

	next();
}

export function setupSidebar( context, next ) {
	context.secondary = <JetpackDashboardSidebar />;
	next();
}

export function jetpackDashboard( context, next ) {
	context.primary = <div>Hi, this is the Jetpack.com Dashboard!</div>;
	next();
}

export function security( context, next ) {
	const siteId = context.params.siteId || 0;
	context.primary = <JetpackDashboardSecurity siteId={ siteId } />;
	next();
}

export function backups( context, next ) {
	context.primary = <div>Backups</div>;
	next();
}

export function scan( context, next ) {
	context.primary = <div>Malware Scan</div>;
	next();
}

export function antiSpam( context, next ) {
	context.primary = <div>Anti-spam</div>;
	next();
}
