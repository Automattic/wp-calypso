import { useSelector } from 'react-redux';
import version_compare from 'calypso/lib/version-compare';
import {
	Notices,
	useNoticesVisibilityQuery,
	processConflictNotices,
} from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import hasSiteProductJetpackStatsFree from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-free';
import hasSiteProductJetpackStatsPaid from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-paid';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import ALL_STATS_NOTICES from './all-notice-definitions';
import { StatsNoticeProps, StatsNoticesProps } from './types';
import usePurchasesToUpdateSiteProducts from './use-purchases-to-update-site-products';
import './style.scss';

const TEAM51_OWNER_ID = 70055110;

const ensureOnlyOneNoticeVisible = (
	serverNoticesVisibility: Notices,
	noticeOptions: StatsNoticeProps
) => {
	const calculatedNoticesVisibility = { ...serverNoticesVisibility };
	ALL_STATS_NOTICES.forEach(
		( notice ) =>
			( calculatedNoticesVisibility[ notice.noticeId ] =
				! notice.disabled &&
				serverNoticesVisibility[ notice.noticeId ] &&
				notice.isVisibleFunc( noticeOptions ) )
	);
	return processConflictNotices( calculatedNoticesVisibility );
};

/**
 * New notices aim to support Calypso and Odyssey stats.
 * New notices are based on async API call and hence is faster than the old notices.
 */
const NewStatsNotices = ( { siteId, isOdysseyStats, statsPurchaseSuccess }: StatsNoticesProps ) => {
	const hasPaidStats = useSelector( ( state ) => hasSiteProductJetpackStatsPaid( state, siteId ) );
	const hasFreeStats = useSelector( ( state ) => hasSiteProductJetpackStatsFree( state, siteId ) );
	// `is_vip` is not correctly placed in Odyssey, so we need to check `options.is_vip` as well.
	const isVip = useSelector(
		( state ) =>
			!! isVipSite( state as object, siteId as number ) ||
			!! getSiteOption( state, siteId, 'is_vip' )
	);
	const isSiteJetpackNotAtomic = useSelector(
		( state ) => !! isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);
	const isWpcom = useSelector( ( state ) => !! isSiteWpcom( state, siteId ) );
	const isP2 = useSelector( ( state ) => !! isSiteWPForTeams( state as object, siteId as number ) );
	const isOwnedByTeam51 = useSelector(
		( state ) => getSelectedSite( state )?.site_owner === TEAM51_OWNER_ID
	);

	const noticeOptions = {
		siteId,
		isOdysseyStats,
		isWpcom,
		isVip,
		isP2,
		isOwnedByTeam51,
		hasPaidStats,
		hasFreeStats,
		isSiteJetpackNotAtomic,
		statsPurchaseSuccess,
	};

	const { isLoading, isError, data: serverNoticesVisibility } = useNoticesVisibilityQuery( siteId );

	const { hasLoadedPurchases } = usePurchasesToUpdateSiteProducts( isOdysseyStats, siteId );

	if ( ! hasLoadedPurchases || isLoading || isError ) {
		return null;
	}

	const calculatedNoticesVisibility = ensureOnlyOneNoticeVisible(
		serverNoticesVisibility,
		noticeOptions
	);

	// TODO: The dismiss logic could potentially be extracted too.
	return (
		<>
			{ ALL_STATS_NOTICES.map(
				( notice ) =>
					calculatedNoticesVisibility[ notice.noticeId ] && (
						<notice.component { ...noticeOptions } />
					)
			) }
		</>
	);
};

/**
 * Return new or old StatsNotices components based on env.
 */
export default function StatsNotices( {
	siteId,
	isOdysseyStats,
	statsPurchaseSuccess,
}: StatsNoticesProps ) {
	const statsAdminVersion = useSelector( ( state: object ) =>
		getJetpackStatsAdminVersion( state, siteId )
	);

	const supportNewStatsNotices =
		! isOdysseyStats ||
		!! ( statsAdminVersion && version_compare( statsAdminVersion, '0.10.0-alpha', '>=' ) );

	if ( ! supportNewStatsNotices ) {
		return null;
	}

	return (
		<NewStatsNotices
			siteId={ siteId }
			isOdysseyStats={ isOdysseyStats }
			statsPurchaseSuccess={ statsPurchaseSuccess }
		/>
	);
}
