/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import JetpackDashboardSecurity from './security';
import JetpackDashboardSidebar from './sidebar';
import { isEnabled } from 'config';
import {
	JETPACK_DASHBOARD_PRIMARY_DOMAIN,
	JETPACK_DASHBOARD_SECONDARY_DOMAIN,
} from 'lib/jetpack-dashboard';
import { preload } from 'sections-helper';

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
