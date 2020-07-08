/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { notFound, makeLayout, render as clientRender } from 'controller';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import wrapInSiteOffsetProvider from 'lib/wrap-in-site-offset';
import wpcomUpsellController from 'lib/jetpack/wpcom-upsell-controller';
import { getSelectedSiteId } from 'state/ui/selectors';
import isJetpackSectionEnabledForSite from 'state/selectors/is-jetpack-section-enabled-for-site';
import {
	showUpsellIfNoScan,
	showUpsellIfNoScanHistory,
	scan,
	scanHistory,
} from 'my-sites/scan/controller';
import WPCOMScanUpsellPage from 'my-sites/scan/wpcom-upsell';
import getIsSiteWPCOM from 'state/selectors/is-site-wpcom';

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
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);
}
