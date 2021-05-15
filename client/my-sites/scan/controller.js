/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import UpsellSwitch from 'calypso/components/jetpack/upsell-switch';
import HasVaultPressSwitch from 'calypso/components/jetpack/has-vaultpress-switch';
import ScanPage from './main';
import ScanHistoryPage from './history';
import ScanUpsellPage from './scan-upsell';
import WPCOMScanUpsellPage from './wpcom-scan-upsell';
import getSiteScanRequestStatus from 'calypso/state/selectors/get-site-scan-request-status';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import IsJetpackDisconnectedSwitch from 'calypso/components/jetpack/is-jetpack-disconnected-switch';
import ScanPlaceholder from 'calypso/components/jetpack/scan-placeholder';
import ScanHistoryPlaceholder from 'calypso/components/jetpack/scan-history-placeholder';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { isJetpackScanSlug } from '@automattic/calypso-products';
import IsCurrentUserAdminSwitch from 'calypso/components/jetpack/is-current-user-admin-switch';
import NotAuthorizedPage from 'calypso/components/jetpack/not-authorized-page';

export function showUpsellIfNoScan( context, next ) {
	context.primary = scanUpsellSwitcher( <ScanPlaceholder />, context.primary );
	next();
}

export function showUpsellIfNoScanHistory( context, next ) {
	context.primary = scanUpsellSwitcher( <ScanHistoryPlaceholder />, context.primary );
	next();
}

export function showNotAuthorizedForNonAdmins( context, next ) {
	context.primary = (
		<IsCurrentUserAdminSwitch
			trueComponent={ context.primary }
			falseComponent={ <NotAuthorizedPage /> }
		/>
	);

	next();
}

export function showJetpackIsDisconnected( context, next ) {
	const JetpackConnectionFailed = isJetpackCloud() ? (
		<ScanUpsellPage reason="no_connected_jetpack" />
	) : (
		<WPCOMScanUpsellPage reason="no_connected_jetpack" />
	);
	context.primary = (
		<IsJetpackDisconnectedSwitch
			trueComponent={ JetpackConnectionFailed }
			falseComponent={ context.primary }
		/>
	);
	next();
}

export function showUnavailableForVaultPressSites( context, next ) {
	const message = isJetpackCloud() ? (
		<ScanUpsellPage reason="vp_active_on_site" />
	) : (
		<WPCOMScanUpsellPage reason="vp_active_on_site" />
	);

	context.primary = (
		<HasVaultPressSwitch trueComponent={ message } falseComponent={ context.primary } />
	);

	next();
}

export function showUnavailableForMultisites( context, next ) {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	if ( isJetpackSiteMultiSite( state, siteId ) ) {
		context.primary = isJetpackCloud() ? (
			<ScanUpsellPage reason="multisite_not_supported" />
		) : (
			<WPCOMScanUpsellPage reason="multisite_not_supported" />
		);
	}

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
