import { FEATURE_SFTP, WPCOM_FEATURES_ATOMIC } from '@automattic/calypso-products';
import page, { Context as PageJSContext } from '@automattic/calypso-router';
import { makeLayout, render as clientRender } from 'calypso/controller';
import { navigation, siteSelection, sites } from 'calypso/my-sites/controller';
import { siteDashboard } from 'calypso/sites-dashboard-v2/controller';
import { DOTCOM_DEVELOPER_TOOLS_PROMO } from 'calypso/sites-dashboard-v2/site-preview-pane/constants';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { devToolsPromo } from './controller';

const redirectForNonSimpleSite = ( context: PageJSContext, next: () => void ) => {
	const state = context.store.getState();
	const site = getSelectedSite( state );
	const siteId = site?.ID ?? null;
	const hasAtomicFeature = siteHasFeature( state, siteId, WPCOM_FEATURES_ATOMIC );
	const hasSftpFeature = siteHasFeature( state, siteId, FEATURE_SFTP );
	const isPlanExpired = !! site?.plan?.expired;

	// Check for site features to determine if the promo should be shown in case the site has yet to transfer to Atomic.
	const shouldShowDevToolsPromo =
		isPlanExpired || ! hasAtomicFeature || ( ! hasSftpFeature && ! site?.is_wpcom_staging_site );

	if ( ( site && site.jetpack && ! site.plan?.expired ) || ! shouldShowDevToolsPromo ) {
		return page.redirect( `/overview/${ context.params.site }` );
	}
	return next();
};

export default function () {
	page( '/dev-tools-promo', siteSelection, sites, makeLayout, clientRender );
	page(
		'/dev-tools-promo/:site',
		siteSelection,
		navigation,
		redirectForNonSimpleSite,
		devToolsPromo,
		siteDashboard( DOTCOM_DEVELOPER_TOOLS_PROMO ),
		makeLayout,
		clientRender
	);
}
