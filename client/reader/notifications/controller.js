/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Notifications from './main';

export function notifications( context, next ) {
	context.primary = <Notifications />;
	next();
}
