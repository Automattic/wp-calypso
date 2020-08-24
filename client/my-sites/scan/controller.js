/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UpsellSwitch from 'components/jetpack/upsell-switch';
import ScanPage from './main';
import ScanHistoryPage from './history';
import ScanUpsellPage from './upsell';
import WPCOMScanUpsellPage from './wpcom-scan-upsell';
import getSiteScanRequestStatus from 'state/selectors/get-site-scan-request-status';
import getSiteScanState from 'state/selectors/get-site-scan-state';
import QueryJetpackScan from 'components/data/query-jetpack-scan';
import ScanPlaceholder from 'components/jetpack/scan-placeholder';
import ScanHistoryPlaceholder from 'components/jetpack/scan-history-placeholder';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import { isJetpackScanSlug } from 'lib/products-values';

export function showUpsellIfNoScan( context, next ) {
	context.primary = scanUpsellSwitcher( <ScanPlaceholder />, context.primary );
	next();
}

export function showUpsellIfNoScanHistory( context, next ) {
	context.primary = scanUpsellSwitcher( <ScanHistoryPlaceholder />, context.primary );
	next();
}

export function scan( context, next ) {
	const { filter } = context.params;
	context.primary = <ScanPage filter={ filter } />;
	next();
}

export function scanHistory( context, next ) {
	const { filter } = context.params;
	context.primary = <ScanHistoryPage filter={ filter } />;
	next();
}

function scanUpsellSwitcher( placeholder, primary ) {
	const UpsellComponent = isJetpackCloud() ? ScanUpsellPage : WPCOMScanUpsellPage;
	return (
		<UpsellSwitch
			UpsellComponent={ UpsellComponent }
			QueryComponent={ QueryJetpackScan }
			getStateForSite={ getSiteScanState }
			isRequestingForSite={ ( state, siteId ) =>
				'pending' === getSiteScanRequestStatus( state, siteId )
			}
			display={ primary }
			productSlugTest={ isJetpackScanSlug }
		>
			{ placeholder }
		</UpsellSwitch>
	);
}
