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

export function redirectIfNotEnabled( context: PageJS.Context, next ) {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		page.redirect( '/' );
		return;
	}
	next();
}

export function main( context: PageJS.Context, next ) {
	context.primary = <Gutenboard />;
	next();
}
