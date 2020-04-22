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

export function scan( context, next ) {
	context.primary = (
		<UpsellSwitch upsell={ <ScanUpsellPage /> } targetCapability="scan">
			<ScanPage />
		</UpsellSwitch>
	);
	next();
}

export function scanHistory( context, next ) {
	const { filter } = context.params;
	context.primary = (
		<UpsellSwitch upsell={ <ScanUpsellPage /> } targetCapability="scan">
			<ScanHistoryPage filter={ filter } />
		</UpsellSwitch>
	);
	next();
}
