import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux'; //useSelector
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector } from 'calypso/state';
import { isJetpackSite, getSiteOption, getSiteSlug } from 'calypso/state/sites/selectors';
import {
	requestStatNoticeSettings,
	receiveStatNoticeSettings,
} from 'calypso/state/stats/notices/actions';
import { isStatsNoticeSettingsFetching } from 'calypso/state/stats/notices/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

const StatsRedirectFlow = () => {
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const siteCreatedTimeStamp = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'created_at' )
	) as string;

	const isCommercial = useSelector( ( state ) => getSiteOption( state, siteId, 'is_commercial' ) );

	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	const { isFetching, data: purchaseRedirect } = useNoticeVisibilityQuery(
		siteId,
		'focus_jetpack_purchase'
	);

	// TODO: update the date to the release date when the feature is ready.
	const redirectToPurchase =
		config.isEnabled( 'stats/checkout-flows-v2' ) &&
		isSiteJetpackNotAtomic &&
		purchaseRedirect &&
		siteCreatedTimeStamp &&
		new Date( siteCreatedTimeStamp ) > new Date( '2024-01-15' );

	const isRequesting = useSelector( ( state: object ) => isStatsNoticeSettingsFetching( state ) );
	const dispatch = useDispatch();

	// Only runs on mount.
	useEffect( () => {
		if ( isFetching ) {
			// when react-query is fetching data
			dispatch( requestStatNoticeSettings( siteId ) );
		} else {
			dispatch(
				receiveStatNoticeSettings( siteId, {
					focus_jetpack_purchase: purchaseRedirect,
				} )
			);
		}
	}, [ dispatch, redirectToPurchase, siteId, isFetching, purchaseRedirect ] );

	// render purchase flow for Jetpack sites created after February 2024
	if ( ! isRequesting && redirectToPurchase && siteSlug ) {
		page.redirect(
			`/stats/purchase/${ siteSlug }?productType=${ isCommercial ? 'commercial' : 'personal' }`
		);

		return;
	}
};

export default StatsRedirectFlow;
