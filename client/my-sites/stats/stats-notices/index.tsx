import config from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import version_compare from 'calypso/lib/version-compare';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import hasSiteProductJetpackStatsPaid from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-paid';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import FeedbackNotice from './feedback-notice';
import FreePlanPurchaseSuccessJetpackStatsNotice from './free-plan-purchase-success-notice';
import LegacyStatsNotices from './legacy-notices';
import OptOutNotice from './opt-out-notice';
import PaidPlanPurchaseSuccessJetpackStatsNotice from './paid-plan-purchase-success-notice';
import { NewStatsNoticesProps, StatsNoticesProps, PurchaseNoticesProps } from './types';
import usePurchasesToUpdateSiteProducts from './use-purchases-to-update-site-products';
import './style.scss';

/**
 * New notices aim to support Calypso and Odyssey stats.
 * New notices are based on async API call and hence is faster than the old notices.
 */
const NewStatsNotices = ( { siteId, isOdysseyStats }: NewStatsNoticesProps ) => {
	const hasPaidStats = useSelector( ( state ) => hasSiteProductJetpackStatsPaid( state, siteId ) );
	const isSiteVip = useSelector( ( state ) => isVipSite( state as object, siteId as number ) );
	const isP2 = useSelector( ( state ) => !! isSiteWPForTeams( state as object, siteId as number ) );

	// TODO: Display error messages on the notice.
	const { hasLoadedPurchases } = usePurchasesToUpdateSiteProducts( isOdysseyStats, siteId );

	const showPaidStatsNotice =
		config.isEnabled( 'stats/paid-stats' ) &&
		! isSiteVip &&
		! isP2 &&
		! hasPaidStats &&
		hasLoadedPurchases;

	return (
		<>
			{ showPaidStatsNotice && <DoYouLoveJetpackStatsNotice siteId={ siteId } /> }
			{ isOdysseyStats && <OptOutNotice siteId={ siteId } /> }
			{ isOdysseyStats && <FeedbackNotice siteId={ siteId } /> }
		</>
	);
};

const PostPurchaseNotices = ( { siteId, statsPurchaseSuccess }: PurchaseNoticesProps ) => {
	// Check if the GET param is passed to show the Free or Paid plan purchase notices
	const showFreePlanPurchaseSuccessNotice = statsPurchaseSuccess === 'free';
	const showPaidPlanPurchaseSuccessNotice = statsPurchaseSuccess === 'paid';

	return (
		<>
			{ /* TODO: Consider combining/refactoring these components into a single component */ }
			{ showPaidPlanPurchaseSuccessNotice && <PaidPlanPurchaseSuccessJetpackStatsNotice /> }
			{ showFreePlanPurchaseSuccessNotice && (
				<FreePlanPurchaseSuccessJetpackStatsNotice siteId={ siteId } />
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
			<NewStatsNotices siteId={ siteId } isOdysseyStats={ isOdysseyStats } />
			<PostPurchaseNotices siteId={ siteId } statsPurchaseSuccess={ statsPurchaseSuccess } />
		</>
	) : (
		<LegacyStatsNotices siteId={ siteId } />
	);
}
