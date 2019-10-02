/**
 * External dependencies
 */
import React from 'react';
import config from 'config';
import page from 'page';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';
import { CreateSite } from './create-site';

export function redirectIfNotEnabled( context, next ) {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		page.redirect( '/' );
		return;
	}
	next();
}

export function main( context, next ) {
	context.primary = <Gutenboard />;
	next();
}

export function createSite( context, next ) {
	context.primary = <CreateSite />;
	next();
}
