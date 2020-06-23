/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { navigation, siteSelection, notFound } from 'my-sites/controller';
import { setScroll, siteSettings } from 'my-sites/site-settings/settings-controller';
import { siteHasScanProductPurchase } from 'state/purchases/selectors';
import isJetpackSectionEnabledForSite from 'state/selectors/is-jetpack-section-enabled-for-site';
import isRewindActive from 'state/selectors/is-rewind-active';
import { getSelectedSiteId } from 'state/ui/selectors';
import { jetpack } from './controller';

const notFoundIfNotEnabled = ( context, next ) => {
	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const showJetpackSection = isJetpackSectionEnabledForSite( state, siteId );
	const hasScanProduct = siteHasScanProductPurchase( state, siteId );
	const hasActiveRewind = isRewindActive( state, siteId );

	if ( ! showJetpackSection || ( ! hasScanProduct && ! hasActiveRewind ) ) {
		return notFound( context, next );
	}

	next();
};

export default function () {
	page(
		'/settings/jetpack/:site_id',
		siteSelection,
		navigation,
		setScroll,
		siteSettings,
		jetpack,
		notFoundIfNotEnabled,
		makeLayout,
		clientRender
	);
}
