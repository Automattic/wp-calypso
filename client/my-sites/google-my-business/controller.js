/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import GMBSelectBusinessType from './select-business-type';

export function selectBusinessType( context, next ) {
	const { params } = context;
	context.primary = <GMBSelectBusinessType siteId={ params.site_id } />;
	next();
}
