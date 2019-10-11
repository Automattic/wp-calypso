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
import { hideMasterbar as hideMasterbarAction } from 'state/ui/actions';

export function redirectIfNotEnabled( context: PageJS.Context, next ) {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		page.redirect( '/' );
		return;
	}
	next();
}

export function hideMasterbar( context: PageJS.Context, next ) {
	context.store.dispatch( hideMasterbarAction() );
	next();
}

export function main( context: PageJS.Context, next ) {
	context.primary = <Gutenboard />;
	next();
}
