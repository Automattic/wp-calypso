import { useState, useEffect } from 'react';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import version_compare from 'calypso/lib/version-compare';
import {
	Notices,
	useNoticesVisibilityQuery,
	processConflictNotices,
} from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector, useDispatch } from 'calypso/state';
import { resetSiteState } from 'calypso/state/purchases/actions';
import { hasLoadedSitePurchasesFromServer } from 'calypso/state/purchases/selectors';
import isSiteOnPaidPlan from 'calypso/state/selectors/is-site-on-paid-plan';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { hasLoadedSitePlansFromServer } from 'calypso/state/sites/plans/selectors';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import hasSiteProductJetpackStatsFree from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-free';
import hasSiteProductJetpackStatsPaid from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-paid';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import ALL_STATS_NOTICES from './all-notice-definitions';
import { StatsNoticeProps, StatsNoticesProps } from './types';
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
	const dispatch = useDispatch();

	// find out if a site is commerical or not. handle potential null value as a false
	const isCommercial = useSelector(
		( state ) => !! getSiteOption( state, siteId, 'is_commercial' )
	);

	// Clear loaded flag when switching sites on Calypso.
	const [ currentSiteId, setCurrentSiteId ] = useState( siteId );
	useEffect( () => {
		if ( siteId !== currentSiteId ) {
			setCurrentSiteId( siteId );
			dispatch( resetSiteState() );
		}
	}, [ siteId, currentSiteId, setCurrentSiteId, dispatch ] );

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

	// Check whether sites have paid plans of WPCOM.
	const siteHasPaidPlan = useSelector( ( state ) => isSiteOnPaidPlan( state, siteId || 0 ) );
	// TODO: Consolidate the proper way of checking WPCOM plans for supporting Stats to `hasSiteProductJetpackStatsPaid`.
	const wpcomSiteHasPaidPlan = isWpcom && siteHasPaidPlan;

	const hasPaidStats =
		useSelector( ( state ) => hasSiteProductJetpackStatsPaid( state, siteId ) ) ||
		wpcomSiteHasPaidPlan;
	const hasFreeStats = useSelector( ( state ) => hasSiteProductJetpackStatsFree( state, siteId ) );

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
		isCommercial,
	};

	const { isLoading, isError, data: serverNoticesVisibility } = useNoticesVisibilityQuery( siteId );

	// TODO: Integrate checking purchases and plans loaded state into `hasSiteProductJetpackStatsPaid`.
	const hasLoadedPurchases = useSelector( ( state ) => hasLoadedSitePurchasesFromServer( state ) );
	// Only check plans loaded state for supporting Stats on WPCOM.
	const hasLoadedPlans =
		useSelector( ( state ) => hasLoadedSitePlansFromServer( state, siteId ) ) || isOdysseyStats;

	if ( ! hasLoadedPurchases || ! hasLoadedPlans || isLoading || isError ) {
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
						<notice.component key={ notice.noticeId } { ...noticeOptions } />
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
		<>
			{ /* The component is replaced on build for Odyssey to query from Jetpack */ }
			<QuerySitePurchases siteId={ siteId } />
			<NewStatsNotices
				siteId={ siteId }
				isOdysseyStats={ isOdysseyStats }
				statsPurchaseSuccess={ statsPurchaseSuccess }
			/>
		</>
	);
}
