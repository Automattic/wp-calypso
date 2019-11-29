/**
 * External dependencies
 */
import React from 'react';
import config from '../../config';
import page from 'page';
import { HashRouter as Router } from 'react-router-dom';

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
	context.layout = (
		<Router>
			<Gutenboard />
		</Router>
	);
	next();
};
