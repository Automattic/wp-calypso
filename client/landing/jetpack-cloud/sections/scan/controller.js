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
	const { filter } = context.params;
	context.primary = <ScanHistoryPage filter={ filter } />;
	next();
}
