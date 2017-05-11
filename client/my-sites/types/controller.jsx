/**
 * External Dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import Types from './main';
import { mapPostStatus } from 'lib/route/path';

export function redirect() {
	page.redirect( '/posts' );
}

export function list( context, next ) {
	const queryParams = {
        type: context.params.type,
        status: mapPostStatus( context.params.status ),
        search: context.query.s
	};

	// use hierarchical ordering for pages
	if(queryParams.type === 'page') {
		queryParams.hierarchical = 1;
	}

	context.primary = (
		<Types query={ queryParams } />
	);

	next();
}
