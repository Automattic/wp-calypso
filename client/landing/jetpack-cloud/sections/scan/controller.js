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
import getSiteScanState from 'state/selectors/get-site-scan-state';
import QueryJetpackScan from 'components/data/query-jetpack-scan';
import ScanPlaceholder from 'landing/jetpack-cloud/components/scan-placeholder';
import ScanHistoryPlaceholder from 'landing/jetpack-cloud/components/scan-history-placeholder';

export function showUpsellIfNoScan( context, next ) {
	context.primary = scanUpsellSwitcher( <ScanPlaceholder />, context.primary );
	next();
}

export function showUpsellIfNoScanHistory( context, next ) {
	context.primary = scanUpsellSwitcher( <ScanHistoryPlaceholder />, context.primary );
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

function scanUpsellSwitcher( placeholder, primary ) {
	return (
		<UpsellSwitch
			UpsellComponent={ ScanUpsellPage }
			display={ primary }
			getStateForSite={ getSiteScanState }
			QueryComponent={ QueryJetpackScan }
		>
			{ placeholder }
		</UpsellSwitch>
	);
}
