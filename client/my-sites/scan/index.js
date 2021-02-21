/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { notFound, makeLayout, render as clientRender } from 'calypso/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import wrapInSiteOffsetProvider from 'calypso/lib/wrap-in-site-offset';
import wpcomUpsellController from 'calypso/lib/jetpack/wpcom-upsell-controller';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import {
	showJetpackIsDisconnected,
	showNotAuthorizedForNonAdmins,
	showUpsellIfNoScan,
	showUpsellIfNoScanHistory,
	showUnavailableForVaultPressSites,
	showUnavailableForMultisites,
	scan,
	scanHistory,
} from 'calypso/my-sites/scan/controller';
import WPCOMScanUpsellPage from 'calypso/my-sites/scan/wpcom-upsell';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';

const notFoundIfNotEnabled = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );
	const isWPCOMSite = getIsSiteWPCOM( state, siteId );

	if ( isWPCOMSite || ( ! isJetpackCloud() && ! showJetpackSection ) ) {
		return notFound( context, next );
	}

	next();
};

export default function () {
	page( '/scan', siteSelection, sites, navigation, makeLayout, clientRender );
	page(
		'/scan/:site',
		siteSelection,
		navigation,
		scan,
		wrapInSiteOffsetProvider,
		showUpsellIfNoScan,
		wpcomUpsellController( WPCOMScanUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	page(
		'/scan/history/:site/:filter?',
		siteSelection,
		navigation,
		scanHistory,
		wrapInSiteOffsetProvider,
		showUpsellIfNoScanHistory,
		wpcomUpsellController( WPCOMScanUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);

	page(
		'/scan/:site/:filter?',
		siteSelection,
		navigation,
		scan,
		wrapInSiteOffsetProvider,
		showUpsellIfNoScan,
		wpcomUpsellController( WPCOMScanUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);
}
