/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackCloudDashboardPage from './main';

export function jetpackCloudDashboard( context, next ) {
	context.primary = <JetpackCloudDashboardPage />;
	next();
}