/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ScanPage from './main';
import ScanHistoryPage from './history';

export function scan( context, next ) {
	context.primary = <ScanPage />;
	next();
}

/**
 * Internal dependencies
 */

export function scanHistory( context, next ) {
	context.primary = <ScanHistoryPage />;
	next();
}
