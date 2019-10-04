/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { preload } from 'sections-helper';

export function preloadJetpackDashboard( context, next ) {
	preload( 'jetpack-dashboard' );
	next();
}

export function jetpackDashboard( context, next ) {
	context.primary = <div>Hello world</div>;

	next();
}
