import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector } from 'calypso/state';
import { isJetpackSite, getSiteOptions, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const StatsRedirectFlow = () => {
	const siteId = useSelector( ( state ) => getSelectedSiteId( state ) );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const siteCreatedTimeStamp = useSelector(
		( state ) => getSiteOptions( state, siteId ?? 0 )?.created_at
	);

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const { data: purchaseRedirect } = useNoticeVisibilityQuery( siteId, 'focus_jetpack_purchase' );

	// TODO: update the date to the release date when the feature is ready.
	const redirectToPurchase =
		config.isEnabled( 'stats/checkout-flows-v2' ) &&
		isSiteJetpackNotAtomic &&
		purchaseRedirect &&
		siteCreatedTimeStamp &&
		new Date( siteCreatedTimeStamp ) > new Date( '2024-01-01' );

	// render purchase flow for Jetpack sites created after February 2024
	if ( redirectToPurchase && siteSlug ) {
		page.redirect( `/stats/purchase/${ siteSlug }` );

		return;
	}
};

export default StatsRedirectFlow;
