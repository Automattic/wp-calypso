import page from '@automattic/calypso-router';
import { notFound, makeLayout, render as clientRender } from 'calypso/controller';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import wpcomAtomicTransfer from 'calypso/lib/jetpack/wpcom-atomic-transfer';
import wrapInSiteOffsetProvider from 'calypso/lib/wrap-in-site-offset';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
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
import isJetpackSectionEnabledForSite from 'calypso/state/selectors/is-jetpack-section-enabled-for-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const notFoundIfNotEnabled =
	( { allowOnAtomic } = {} ) =>
	( context, next ) => {
		const state = context.store.getState();
		const siteId = getSelectedSiteId( state );
		const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );
		const disabled = allowOnAtomic
			? getIsSiteWPCOM( state, siteId ) && ! isAtomicSite( state, siteId )
			: getIsSiteWPCOM( state, siteId );

		if ( disabled || ( ! isJetpackCloud() && ! showJetpackSection ) ) {
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
		wpcomAtomicTransfer( WPCOMScanUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled(),
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
		wpcomAtomicTransfer( WPCOMScanUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled( { allowOnAtomic: true } ),
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
		wpcomAtomicTransfer( WPCOMScanUpsellPage ),
		showUnavailableForVaultPressSites,
		showJetpackIsDisconnected,
		showUnavailableForMultisites,
		showNotAuthorizedForNonAdmins,
		notFoundIfNotEnabled(),
		makeLayout,
		clientRender
	);
}
