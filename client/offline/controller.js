/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Offline from 'components/offline';

export function offline( context, next ) {
	context.primary = <Offline />;
	next();
}
