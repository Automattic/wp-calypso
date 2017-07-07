/**
 * External dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import React from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import route from 'lib/route';
import CommentsManagement from './main';
import controller from 'my-sites/controller';

export const comments = function( context ) {
	const siteFragment = route.getSiteFragment( context.path );
	const status = context.params.status === 'pending' ? 'unapproved' : context.params.status;

	renderWithReduxStore(
		<CommentsManagement
			basePath={ context.path }
			siteFragment={ siteFragment }
			status={ status }
		/>,
		'primary',
		context.store
	);
};

export const sites = function( context ) {
	const { status } = context.params;
	const siteFragment = route.getSiteFragment( context.path );

	if ( status === siteFragment ) {
		return page.redirect( `/comments/pending/${ siteFragment }` );
	}
	controller.sites( context );
};
