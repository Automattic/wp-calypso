import { isJetpackScanSlug } from '@automattic/calypso-products';
import QueryJetpackScan from 'calypso/components/data/query-jetpack-scan';
import HasVaultPressSwitch from 'calypso/components/jetpack/has-vaultpress-switch';
import IsCurrentUserAdminSwitch from 'calypso/components/jetpack/is-current-user-admin-switch';
import IsJetpackDisconnectedSwitch from 'calypso/components/jetpack/is-jetpack-disconnected-switch';
import NotAuthorizedPage from 'calypso/components/jetpack/not-authorized-page';
import ScanHistoryPlaceholder from 'calypso/components/jetpack/scan-history-placeholder';
import { UpsellProductCardPlaceholder } from 'calypso/components/jetpack/upsell-product-card/index';
import UpsellSwitch from 'calypso/components/jetpack/upsell-switch';
import { SiteOffsetProvider } from 'calypso/components/site-offset/context';
import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import ScanHistoryPage from 'calypso/my-sites/scan/history';
import ScanPage from 'calypso/my-sites/scan/main';
import ScanUpsellPage from 'calypso/my-sites/scan/scan-upsell';
import WPCOMScanUpsellPage from 'calypso/my-sites/scan/wpcom-scan-upsell';
import WpcomScanUpsellPlaceholder from 'calypso/my-sites/scan/wpcom-scan-upsell-placeholder';
import getSiteScanRequestStatus from 'calypso/state/selectors/get-site-scan-request-status';
import getSiteScanState from 'calypso/state/selectors/get-site-scan-state';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

export const showUpsellIfNoScan = ( context, next ) => {
	const ScanUpsellPlaceholder =
		isJetpackCloud() || isA8CForAgencies()
			? UpsellProductCardPlaceholder
			: WpcomScanUpsellPlaceholder;
	context.featurePreview = scanUpsellSwitcher( <ScanUpsellPlaceholder />, context.featurePreview );
	next();
};

export const showUpsellIfNoScanHistory = ( context, next ) => {
	context.featurePreview = scanUpsellSwitcher( <ScanHistoryPlaceholder />, context.featurePreview );
	next();
};

export const showNotAuthorizedForNonAdmins = ( context, next ) => {
	context.featurePreview = (
		<IsCurrentUserAdminSwitch
			trueComponent={ context.featurePreview }
			falseComponent={ <NotAuthorizedPage /> }
		/>
	);

	next();
};

export const showJetpackIsDisconnected = ( context, next ) => {
	const JetpackConnectionFailed =
		isJetpackCloud() || isA8CForAgencies() ? (
			<ScanUpsellPage reason="no_connected_jetpack" />
		) : (
			<WPCOMScanUpsellPage reason="no_connected_jetpack" />
		);
	context.featurePreview = (
		<IsJetpackDisconnectedSwitch
			trueComponent={ JetpackConnectionFailed }
			falseComponent={ context.featurePreview }
		/>
	);
	next();
};

export const showUnavailableForVaultPressSites = ( context, next ) => {
	const message =
		isJetpackCloud() || isA8CForAgencies() ? (
			<ScanUpsellPage reason="vp_active_on_site" />
		) : (
			<WPCOMScanUpsellPage reason="vp_active_on_site" />
		);

	context.featurePreview = (
		<HasVaultPressSwitch trueComponent={ message } falseComponent={ context.featurePreview } />
	);

	next();
};

export const showUnavailableForMultisites = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	if ( siteId && isJetpackSiteMultiSite( state, siteId ) ) {
		context.featurePreview =
			isJetpackCloud() || isA8CForAgencies() ? (
				<ScanUpsellPage reason="multisite_not_supported" />
			) : (
				<WPCOMScanUpsellPage reason="multisite_not_supported" />
			);
	}

	next();
};

export const scan = ( context, next ) => {
	const { filter } = context.params;
	context.featurePreview = <ScanPage filter={ filter } />;
	next();
};

export const scanHistory = ( context, next ) => {
	const { filter } = context.params;
	context.featurePreview = <ScanHistoryPage filter={ filter } />;
	next();
};

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

export function wrapInSiteOffsetProvider( context, next ) {
	context.featurePreview = (
		<SiteOffsetProvider site={ context.params.site }>{ context.featurePreview }</SiteOffsetProvider>
	);
	next();
}
