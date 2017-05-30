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

export const comments = function( context ) {
	const siteSlug = route.getSiteFragment( context.path );
	const status = ( context.params.status && siteSlug !== context.params.status )
		? context.params.status
		: 'unapproved';

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
