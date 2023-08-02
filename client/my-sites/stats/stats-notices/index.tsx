import config from '@automattic/calypso-config';
import page from 'page';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import version_compare from 'calypso/lib/version-compare';
import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import getSiteOption from 'calypso/state/sites/selectors/get-site-option';
import hasSiteProductJetpackStatsFree from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-free';
import hasSiteProductJetpackStatsPaid from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-paid';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import getSelectedSite from 'calypso/state/ui/selectors/get-selected-site';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import FeedbackNotice from './feedback-notice';
import FreePlanPurchaseSuccessJetpackStatsNotice from './free-plan-purchase-success-notice';
import LegacyStatsNotices from './legacy-notices';
import removeStatsPurchaseSuccessParam from './lib/remove-stats-purchase-success-param';
import OptOutNotice from './opt-out-notice';
import PaidPlanPurchaseSuccessJetpackStatsNotice from './paid-plan-purchase-success-notice';
import { StatsNoticesProps } from './types';
import usePurchasesToUpdateSiteProducts from './use-purchases-to-update-site-products';
import './style.scss';

const TEAM51_OWNER_ID = 70055110;

/**
 * New notices aim to support Calypso and Odyssey stats.
 * New notices are based on async API call and hence is faster than the old notices.
 */
const NewStatsNotices = ( { siteId, isOdysseyStats }: StatsNoticesProps ) => {
	const hasPaidStats = useSelector( ( state ) => hasSiteProductJetpackStatsPaid( state, siteId ) );
	const hasFreeStats = useSelector( ( state ) => hasSiteProductJetpackStatsFree( state, siteId ) );
	// `is_vip` is not correctly placed in Odyssey, so we need to check `options.is_vip` as well.
	const isVip = useSelector(
		( state ) =>
			isVipSite( state as object, siteId as number ) || getSiteOption( state, siteId, 'is_vip' )
	);
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);
	const isWpcom = useSelector( ( state ) => isSiteWpcom( state, siteId ) );
	const isP2 = useSelector( ( state ) => !! isSiteWPForTeams( state as object, siteId as number ) );
	const isOwnedByTeam51 = useSelector(
		( state ) => getSelectedSite( state )?.site_owner === TEAM51_OWNER_ID
	);

	// TODO: Display error messages on the notice.
	const { hasLoadedPurchases } = usePurchasesToUpdateSiteProducts( isOdysseyStats, siteId );

	// Gate notices for WPCOM sites behind a flag.
	const showUpgradeNoticeForWpcomSites =
		config.isEnabled( 'stats/paid-wpcom-stats' ) &&
		isWpcom &&
		! isVip &&
		! isP2 &&
		! isOwnedByTeam51;
	// Show the notice if the site is Jetpack or it is Odyssey Stats.
	const showUpgradeNoticeOnOdyssey = config.isEnabled( 'stats/paid-stats' ) && isOdysseyStats;
	const showUpgradeNoticeForJetpackNotAtomic =
		config.isEnabled( 'stats/paid-stats' ) && isSiteJetpackNotAtomic;

	const showDoYouLoveJetpackStatsNotice =
		( showUpgradeNoticeOnOdyssey ||
			showUpgradeNoticeForJetpackNotAtomic ||
			showUpgradeNoticeForWpcomSites ) &&
		// Show the notice if the site has not purchased the paid stats product.
		! hasPaidStats &&
		hasLoadedPurchases;

	return (
		<>
			{ showDoYouLoveJetpackStatsNotice && (
				<DoYouLoveJetpackStatsNotice siteId={ siteId } hasFreeStats={ hasFreeStats } />
			) }
			{ isOdysseyStats && <OptOutNotice siteId={ siteId } /> }
			{ isOdysseyStats && <FeedbackNotice siteId={ siteId } /> }
		</>
	);
};

const PostPurchaseNotices = ( {
	siteId,
	statsPurchaseSuccess,
	isOdysseyStats,
}: StatsNoticesProps ) => {
	// Check if the GET param is passed to show the Free or Paid plan purchase notices
	const showFreePlanPurchaseSuccessNotice = statsPurchaseSuccess === 'free';
	const showPaidPlanPurchaseSuccessNotice = statsPurchaseSuccess === 'paid';

	const [ paramRemoved, setParamRemoved ] = useState( false );

	const removeParam = () => {
		if ( ! statsPurchaseSuccess || paramRemoved ) {
			return;
		}
		// Ensure it runs only once.
		setParamRemoved( true );
		const newUrlObj = removeStatsPurchaseSuccessParam( window.location.href, !! isOdysseyStats );
		// Odyssey would try to hack the URL on load to remove duplicate params. We need to wait for that to finish.
		setTimeout( () => {
			window.history.replaceState( null, '', newUrlObj.toString() );
			if ( isOdysseyStats ) {
				// We need to update the page base if it changed. Otherwise, pagejs won't be able to find the routes.
				page.base( `${ newUrlObj.pathname }${ newUrlObj.search }` );
			}
		}, 300 );
	};

	return (
		<>
			{ /* TODO: Consider combining/refactoring these components into a single component */ }
			{ showPaidPlanPurchaseSuccessNotice && (
				<PaidPlanPurchaseSuccessJetpackStatsNotice onNoticeViewed={ removeParam } />
			) }
			{ showFreePlanPurchaseSuccessNotice && (
				<FreePlanPurchaseSuccessJetpackStatsNotice
					siteId={ siteId }
					onNoticeViewed={ removeParam }
				/>
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

	return supportNewStatsNotices ? (
		<>
			<PostPurchaseNotices
				siteId={ siteId }
				statsPurchaseSuccess={ statsPurchaseSuccess }
				isOdysseyStats={ isOdysseyStats }
			/>
			<NewStatsNotices siteId={ siteId } isOdysseyStats={ isOdysseyStats } />
		</>
	) : (
		<LegacyStatsNotices siteId={ siteId } />
	);
}
