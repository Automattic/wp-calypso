import { FEATURE_STATS_PAID } from '@automattic/calypso-products';
import { useState, useEffect, useRef } from 'react';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import {
	DEFAULT_NOTICES_VISIBILITY,
	Notices,
	useNoticesVisibilityQuery,
	processConflictNotices,
} from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { useSelector, useDispatch } from 'calypso/state';
import { resetSiteState } from 'calypso/state/purchases/actions';
import { hasLoadedSitePurchasesFromServer } from 'calypso/state/purchases/selectors';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { hasLoadedSitePlansFromServer } from 'calypso/state/sites/plans/selectors';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import hasSiteProductJetpackStatsFree from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-free';
import hasSiteProductJetpackStatsPaid from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-paid';
import hasSiteProductJetpackStatsPWYWOnly from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-pwyw-only';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import useStatsPurchases, { shouldShowPaywallNotice } from '../hooks/use-stats-purchases';
import { AllTimeData } from '../sections/all-time-highlights-section';
import ALL_STATS_NOTICES from './all-notice-definitions';
import { StatsNoticeProps, StatsNoticesProps } from './types';
import './style.scss';

const TEAM51_OWNER_ID = 70055110;
const SIGNIFICANT_VIEWS_AMOUNT = 100;

declare global {
	interface Window {
		initJetpackJITM: () => void;
		jitm_config: {
			nonce: string;
		};
	}
}

const JetpackAdminNotices: React.FC = () => {
	const jitmContainerRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		// Load CSS
		const link: HTMLLinkElement = document.createElement( 'link' );
		link.href =
			'https://ready-carp-caterpillar.jurassic.ninja/wp-content/plugins/jetpack/jetpack_vendor/automattic/jetpack-jitm/build/index.css';
		link.rel = 'stylesheet';
		document.head.appendChild( link );

		// Load JavaScript
		const script: HTMLScriptElement = document.createElement( 'script' );
		script.src =
			'https://ready-carp-caterpillar.jurassic.ninja/wp-content/plugins/jetpack/jetpack_vendor/automattic/jetpack-jitm/build/index.js';
		script.async = true;

		script.onload = () => {
			// Call reFetch after the script has loaded
			if ( window.initJetpackJITM ) {
				window.initJetpackJITM();
			}
		};

		document.body.appendChild( script );

		// Cleanup function
		return () => {
			document.head.removeChild( link );
			document.body.removeChild( script );
		};
	}, [] ); // Empty dependency array ensures this runs only once on mount

	return (
		<>
			<div
				ref={ jitmContainerRef }
				id="jp-admin-notices"
				className="jetpack-jitm-message"
				data-message-path="wp:jetpack_page_stats:admin_notices"
				data-query="page%3Dstats"
				data-nonce={ window.jitm_config.nonce } // Replace with actual nonce
			></div>
		</>
	);
};

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

	const wpcomSiteHasPaidStatsFeature = useSelector(
		( state ) => isWpcom && siteHasFeature( state, siteId, FEATURE_STATS_PAID )
	);

	const hasPaidStats =
		useSelector( ( state ) => hasSiteProductJetpackStatsPaid( state, siteId ) ) ||
		wpcomSiteHasPaidStatsFeature;
	const hasFreeStats = useSelector( ( state ) => hasSiteProductJetpackStatsFree( state, siteId ) );

	const { isRequestingSitePurchases, isCommercialOwned, supportCommercialUse } =
		useStatsPurchases( siteId );

	const hasPWYWPlanOnly = useSelector( ( state ) =>
		hasSiteProductJetpackStatsPWYWOnly( state, siteId )
	);

	// Show the paywall notice if the site has reached the monthly views limit
	// and no commercial purchase.
	const showPaywallNotice =
		useSelector( ( state ) => {
			return shouldShowPaywallNotice( state, siteId );
		} ) &&
		! supportCommercialUse &&
		isSiteJetpackNotAtomic;

	const { views } = useSelector(
		( state ) => getSiteStatsNormalizedData( state, siteId, 'stats', {} ) || {}
	) as AllTimeData;
	const hasSignificantViews = !! ( views && views >= SIGNIFICANT_VIEWS_AMOUNT );

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
		isCommercialOwned,
		hasPWYWPlanOnly,
		hasSignificantViews,
		showPaywallNotice,
	};

	const { isLoading, isError, data: serverNoticesVisibility } = useNoticesVisibilityQuery( siteId );

	// TODO: Integrate checking purchases and plans loaded state into `hasSiteProductJetpackStatsPaid`.
	const hasLoadedPurchases = useSelector( hasLoadedSitePurchasesFromServer );
	// Only check plans loaded state for supporting Stats on WPCOM.
	const hasLoadedPlans =
		useSelector( ( state ) => hasLoadedSitePlansFromServer( state, siteId ) ) || isOdysseyStats;

	if (
		! hasLoadedPurchases ||
		! hasLoadedPlans ||
		isLoading ||
		isError ||
		isRequestingSitePurchases
	) {
		return null;
	}

	const calculatedNoticesVisibility = ensureOnlyOneNoticeVisible(
		serverNoticesVisibility ?? DEFAULT_NOTICES_VISIBILITY,
		noticeOptions
	);

	const allNotices = ALL_STATS_NOTICES.map(
		( notice ) =>
			calculatedNoticesVisibility[ notice.noticeId ] && (
				<notice.component key={ notice.noticeId } { ...noticeOptions } />
			)
	).filter( Boolean );

	// TODO: The dismiss logic could potentially be extracted too.
	return (
		<>
			{ allNotices }
			{ /* JITM Container */ }
			{ allNotices.length === 0 && <JetpackAdminNotices /> }
		</>
	);
};

/**
 * Return new or old StatsNotices components based on env.
 * JITM is rendered in the component as well.
 */
export default function StatsNotices( {
	siteId,
	isOdysseyStats,
	statsPurchaseSuccess,
}: StatsNoticesProps ) {
	const { supportsNewStatsNotices } = useSelector( ( state ) =>
		getEnvStatsFeatureSupportChecks( state, siteId )
	);

	if ( ! supportsNewStatsNotices ) {
		return null;
	}

	return (
		<>
			{ siteId && <QuerySiteStats siteId={ siteId } statType="stats" query={ {} } /> }
			<NewStatsNotices
				siteId={ siteId }
				isOdysseyStats={ isOdysseyStats }
				statsPurchaseSuccess={ statsPurchaseSuccess }
			/>
		</>
	);
}
