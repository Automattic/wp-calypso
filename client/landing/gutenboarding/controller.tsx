/**
 * External dependencies
 */
import React from 'react';
import config from '../../config';
import page from 'page';

/**
 * Internal dependencies
 */
import { Gutenboard } from './gutenboard';

export const redirectIfNotEnabled: PageJS.Callback = ( context, next ) => {
	if ( ! config.isEnabled( 'gutenboarding' ) ) {
		page.redirect( '/' );
		return;
	}
	next();
};

export const main: PageJS.Callback = ( context, next ) => {
	context.layout = <Gutenboard />;
	next();
};
