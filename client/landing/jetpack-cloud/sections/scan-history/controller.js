/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackCloudScanHistoryPage from './main';

export function jetpackCloudScanHistory( context, next ) {
	context.primary = <JetpackCloudScanHistoryPage />;
	next();
}