/**
 * External dependencies
 */
import { renderWithReduxStore } from 'lib/react-helpers';
import React from 'react';

/**
 * Internal dependencies
 */
import route from 'lib/route';
import CommentsManagement from './main';
import controller from 'my-sites/controller';
import { routeTo } from 'state/ui/actions';

export const comments = function( context ) {
	const siteSlug = route.getSiteFragment( context.path );
	const status = context.params.status === 'pending' ? 'unapproved' : context.params.status;

	renderWithReduxStore(
		<CommentsManagement
			basePath={ context.path }
			siteSlug={ siteSlug }
			status={ status }
		/>,
		'primary',
		context.store
	);
};

export const sites = function( context ) {
	const { status } = context.params;
	const siteSlug = route.getSiteFragment( context.path );

	if ( status === siteSlug ) {
		return context.store.dispatch(
			routeTo( `/comments/pending/${ siteSlug }` )
		);
	}
	controller.sites( context );
};
