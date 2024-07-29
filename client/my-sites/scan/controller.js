import { isJetpackScanSlug } from '@automattic/calypso-products';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import HasVaultPressSwitch from 'calypso/components/jetpack/has-vaultpress-switch';
import IsCurrentUserAdminSwitch from 'calypso/components/jetpack/is-current-user-admin-switch';
import IsJetpackDisconnectedSwitch from 'calypso/components/jetpack/is-jetpack-disconnected-switch';
import NotAuthorizedPage from 'calypso/components/jetpack/not-authorized-page';
import ScanHistoryPlaceholder from 'calypso/components/jetpack/scan-history-placeholder';
import { UpsellProductCardPlaceholder } from 'calypso/components/jetpack/upsell-product-card/index.tsx';
import UpsellSwitch from 'calypso/components/jetpack/upsell-switch';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import getSiteScanRequestStatus from 'calypso/state/selectors/get-site-scan-request-status';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import ScanHistoryPage from './history';
import ScanPage from './main';
import ScanUpsellPage from './scan-upsell';
import WPCOMScanUpsellPage from './wpcom-scan-upsell';
import WpcomScanUpsellPlaceholder from './wpcom-scan-upsell-placeholder';

export function showUpsellIfNoScan( context, next ) {
	const ScanUpsellPlaceholder =
		isJetpackCloud() || isA8CForAgencies()
			? UpsellProductCardPlaceholder
			: WpcomScanUpsellPlaceholder;
	context.primary = scanUpsellSwitcher( <ScanUpsellPlaceholder />, context.primary );
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
	const JetpackConnectionFailed =
		isJetpackCloud() || isA8CForAgencies() ? (
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
	const message =
		isJetpackCloud() || isA8CForAgencies() ? (
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
		context.primary =
			isJetpackCloud() || isA8CForAgencies() ? (
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
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showScanNavigation = ! isAtomicSite( state, siteId ) && isJetpackCloud();
	const { filter } = context.params;
	context.primary = <ScanHistoryPage filter={ filter } showNavigation={ showScanNavigation } />;
	next();
}

function scanUpsellSwitcher( placeholder, primary ) {
	const UpsellComponent =
		isJetpackCloud() || isA8CForAgencies() ? ScanUpsellPage : WPCOMScanUpsellPage;
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
