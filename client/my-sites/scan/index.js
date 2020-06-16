/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { navigation, siteSelection, sites } from 'my-sites/controller';
import { makeLayout, render as clientRender, renderNotFound } from 'controller';
import isJetpackCloud from 'lib/jetpack/is-jetpack-cloud';
import wrapInSiteOffsetProvider from 'lib/jetpack/wrap-in-site-offset';
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

const renderNotFoundIfNotEnabled = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );

	if ( ! isJetpackCloud() && ! showJetpackSection ) {
		return renderNotFound( context, next );
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
		renderNotFoundIfNotEnabled,
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
		renderNotFoundIfNotEnabled,
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
		renderNotFoundIfNotEnabled,
		makeLayout,
		clientRender
	);
}
