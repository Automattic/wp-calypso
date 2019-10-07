/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import JetpackDashboardSidebar from './sidebar';
import { preload } from 'sections-helper';

export function preloadJetpackDashboard( context, next ) {
	preload( 'jetpack-dashboard' );
	next();
}

export function setupSidebar( context, next ) {
	context.secondary = <JetpackDashboardSidebar />;
	next();
}

export function jetpackDashboard( context, next ) {
	context.primary = <div>Jetpack.com Dashboard</div>;

	next();
}
