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

export function security( context, next ) {
	context.primary = <div>Security</div>;
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
