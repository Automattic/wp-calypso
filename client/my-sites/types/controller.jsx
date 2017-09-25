/**
 * External dependencies
 */
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Types from './main';
import { mapPostStatus } from 'lib/route/path';

export function redirect() {
	page.redirect( '/posts' );
}

export function list( context, next ) {
	context.primary = (
		<Types query={ {
			type: context.params.type,
			status: mapPostStatus( context.params.status ),
			search: context.query.s
		} } />
	);

	next();
}
