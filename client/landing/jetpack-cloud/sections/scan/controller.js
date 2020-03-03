/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import ScanPage from './main';
import ScanScannerPage from './scanner';
import ScanHistoryPage from './history';

export function scan( context, next ) {
	context.primary = <ScanPage />;
	next();
}

export function scanner( context, next ) {
	context.primary = <ScanScannerPage />;
	next();
}

export function scanHistory( context, next ) {
	context.primary = <ScanHistoryPage />;
	next();
}
