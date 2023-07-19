import config from '@automattic/calypso-config';
import { useSelector } from 'react-redux';
import version_compare from 'calypso/lib/version-compare';
import getJetpackStatsAdminVersion from 'calypso/state/sites/selectors/get-jetpack-stats-admin-version';
import hasSiteProductJetpackStatsPaid from 'calypso/state/sites/selectors/has-site-product-jetpack-stats-paid';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import FeedbackNotice from './feedback-notice';
import FreePlanPurchaseSuccessJetpackStatsNotice from './free-plan-purchase-success-notice';
import LegacyStatsNotices from './legacy-notices';
import OptOutNotice from './opt-out-notice';
import PaidPlanPurchaseSuccessJetpackStatsNotice from './paid-plan-purchase-success-notice';
import { StatsNoticesProps } from './types';
import usePurchasesToUpdateSiteProducts from './use-purchases-to-update-site-products';
import './style.scss';

/**
 * New notices aim to support Calypso and Odyssey stats.
 * New notices are based on async API call and hence is faster than the old notices.
 */
const NewStatsNotices = ( { siteId, isOdysseyStats }: StatsNoticesProps ) => {
	const hasPaidStats = useSelector( ( state ) => hasSiteProductJetpackStatsPaid( state, siteId ) );
	const isSiteJetpackNotAtomic = useSelector( ( state ) =>
		isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } )
	);

	// TODO: Display error messages on the notice.
	const { hasLoadedPurchases } = usePurchasesToUpdateSiteProducts( isOdysseyStats, siteId );

	const showPaidStatsNotice =
		config.isEnabled( 'stats/paid-stats' ) &&
		isSiteJetpackNotAtomic &&
		! hasPaidStats &&
		hasLoadedPurchases;

	const showFreePlanPurchaseSuccessNotice = config.isEnabled( 'stats/paid-stats' ) && false;
	const showPaidPlanPurchaseSuccessNotice = config.isEnabled( 'stats/paid-stats' ) && false;

	return (
		<>
			{ showPaidPlanPurchaseSuccessNotice && (
				<PaidPlanPurchaseSuccessJetpackStatsNotice siteId={ siteId } />
			) }
			{ showFreePlanPurchaseSuccessNotice && (
				<FreePlanPurchaseSuccessJetpackStatsNotice siteId={ siteId } />
			) }
			{ showPaidStatsNotice && <DoYouLoveJetpackStatsNotice siteId={ siteId } /> }
			{ isOdysseyStats && <OptOutNotice siteId={ siteId } /> }
			{ isOdysseyStats && <FeedbackNotice siteId={ siteId } /> }
		</>
	);
};

/**
 * Return new or old StatsNotices components based on env.
 */
export default function StatsNotices( { siteId, isOdysseyStats }: StatsNoticesProps ) {
	const statsAdminVersion = useSelector( ( state: object ) =>
		getJetpackStatsAdminVersion( state, siteId )
	);
	const supportNewStatsNotices =
		! isOdysseyStats ||
		!! ( statsAdminVersion && version_compare( statsAdminVersion, '0.10.0-alpha', '>=' ) );

	return supportNewStatsNotices ? (
		<NewStatsNotices siteId={ siteId } isOdysseyStats={ isOdysseyStats } />
	) : (
		<LegacyStatsNotices siteId={ siteId } />
	);
}
