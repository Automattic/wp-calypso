/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import JetpackCloudScanPage from './main';

export function jetpackCloudScan( context, next ) {
	context.primary = <JetpackCloudScanPage />;
	next();
}