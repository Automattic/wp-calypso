/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UpsellSwitch from 'landing/jetpack-cloud/components/upsell-switch';
import ScanPage from './main';
import ScanHistoryPage from './history';
import ScanUpsellPage from './upsell';

export function showUpsellIfNoScan( context, next ) {
	context.primary = (
		<UpsellSwitch upsell={ <ScanUpsellPage /> } targetCapability="scan">
			{ context.primary }
		</UpsellSwitch>
	);
	next();
}

export function scan( context, next ) {
	context.primary = <ScanPage />;
	next();
}

export function scanHistory( context, next ) {
	const { filter } = context.params;
	context.primary = <ScanHistoryPage filter={ filter } />;
	next();
}
