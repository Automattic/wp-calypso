/**
 * External Dependencies
 *
 * @format
 */

import React from 'react';

/**
 * Internal Dependencies
 */

import GMBSelectBusinessType from '../select-business-type';

export function show( context, next ) {
	const { params } = context;
	context.primary = <GMBSelectBusinessType { ...params } />;
	next();
}
