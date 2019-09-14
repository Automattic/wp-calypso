/** @format */
/**
 * External dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import Types from './main';
import { mapPostStatus } from 'lib/route';
import { POST_STATUSES } from 'state/posts/constants';

export function redirect() {
	page.redirect( '/posts' );
}

export function list( context, next ) {
	const search = context.query.s;
	context.primary = (
		<Types
			query={ {
				type: context.params.type,
				// When searching, search across all statuses so the user can
				// always find what they are looking for, regardless of what
				// tab the search was initiated from. Use POST_STATUSES rather
				// than "any" to do this, since the latter excludes trashed
				// posts.
				status: search ? POST_STATUSES.join( ',' ) : mapPostStatus( context.params.status ),
				search,
			} }
			statusSlug={ context.params.status }
		/>
	);

	next();
}
