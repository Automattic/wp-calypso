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
import { mapPostStatus } from 'client/lib/route/path';

export function redirect() {
	page.redirect( '/posts' );
}

export function list( context, next ) {
	context.primary = (
		<Types
			query={ {
				type: context.params.type,
				status: mapPostStatus( context.params.status ),
				search: context.query.s,
			} }
		/>
	);

	next();
}
