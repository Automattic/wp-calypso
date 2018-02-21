/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import GoogleMyBusinessSelectBusinessType from './select-business-type';

export function selectBusinessType( context, next ) {
	const { params } = context;
	context.primary = <GoogleMyBusinessSelectBusinessType siteId={ params.site_id } />;
	next();
}
