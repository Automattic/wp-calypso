/**
 * External Dependencies
 */
import React from 'react';
import page from 'page';

/**
 * Internal Dependencies
 */
import Types from './main';

export function redirect() {
	page.redirect( '/posts' );
}

export function list( context, next ) {
	context.primary = (
		<Types query={ {
			type: context.params.type,
			status: context.params.status || 'publish',
			search: context.query.s
		} } />
	);

	next();
}
