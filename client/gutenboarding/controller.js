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

export function redirectIfNotEnabled( context, next ) {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		page.redirect( '/' );
	}

	next();
}

export function main( context, next ) {
	context.primary = <Gutenboard />;

	next();
}
