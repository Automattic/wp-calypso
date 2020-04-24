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

export function showUpsellIfNoScan( context, next ) {
	context.primary = (
		<UpsellSwitch
			UpsellComponent={ ScanUpsellPage }
			display={ context.primary }
			getStateForSite={ getSiteScanState }
			QueryComponent={ QueryJetpackScan }
		>
			<div className="scan__content">
				<div className="scan__is-loading" />
			</div>
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
