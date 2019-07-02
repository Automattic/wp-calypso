/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import CustomerHome from './main';

export function customerHome( context, next ) {
	context.primary = <CustomerHome site={ context.params.site } />;
	next();
}
