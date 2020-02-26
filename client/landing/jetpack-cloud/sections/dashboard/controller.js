/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import DashboardPage from './main';

export function dashboard( context, next ) {
	context.primary = <DashboardPage />;
	next();
}
