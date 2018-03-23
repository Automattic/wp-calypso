/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import GoogleMyBusinessNewAccount from './new-account';
import GoogleMyBusinessSelectBusinessType from './select-business-type';

export function newAccount( context, next ) {
	const { params } = context;

	context.primary = <GoogleMyBusinessNewAccount siteId={ params.site_id } />;

	next();
}

export function selectBusinessType( context, next ) {
	const { params } = context;

	context.primary = <GoogleMyBusinessSelectBusinessType siteId={ params.site_id } />;

	next();
}
