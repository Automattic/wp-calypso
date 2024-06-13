import config from '@automattic/calypso-config';
import { NoticeIdType } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import CommercialSiteUpgradeNotice from './commercial-site-upgrade-notice';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import FreePlanPurchaseSuccessJetpackStatsNotice from './free-plan-purchase-success-notice';
import PaidPlanPurchaseSuccessJetpackStatsNotice from './paid-plan-purchase-success-notice';
import TierUpgradeNotice from './tier-upgrade-notice';
import { StatsNoticeProps } from './types';

type StatsNoticeType = {
	component: React.ComponentType< StatsNoticeProps >;
	noticeId: NoticeIdType;
	isVisibleFunc: ( options: StatsNoticeProps ) => boolean;
	disabled: boolean;
};

function shouldShowCommercialUpgradeNotice( options: StatsNoticeProps ) {
	// eslint-disable-next-line prefer-rest-params
	console.log( 'arguments: ', arguments );
	// Pull props.
	const {
		isOdysseyStats,
		isWpcom,
		isVip,
		isP2,
		isOwnedByTeam51,
		hasPaidStats,
		isSiteJetpackNotAtomic,
		isCommercial,
		isCommercialOwned,
	} = options;

	// Show notice for Jetpack-connected sites that are not Atomic AND
	// they are classified as commercial but do not have a commercial license.
	const showUpgradeNoticeOnOdyssey = isOdysseyStats;
	const showUpgradeNoticeForJetpackNotAtomic = isSiteJetpackNotAtomic;
	if ( showUpgradeNoticeOnOdyssey || showUpgradeNoticeForJetpackNotAtomic ) {
		if ( isVip || isOwnedByTeam51 ) {
			return false;
		}
		if ( isCommercial && ! isCommercialOwned ) {
			return true;
		}
	}

	// Test for WPCOM sites.
	const showUpgradeNoticeForWpcomSites = isWpcom && ! isP2 && ! isOwnedByTeam51;

	return !! (
		( showUpgradeNoticeOnOdyssey ||
			showUpgradeNoticeForJetpackNotAtomic ||
			showUpgradeNoticeForWpcomSites ) &&
		// Show the notice if the site has not purchased the paid stats product.
		! hasPaidStats &&
		// Show the notice only if the site is commercial.
		isCommercial &&
		! isVip
	);
}

/** Sorted by priority */
const ALL_STATS_NOTICES: StatsNoticeType[] = [
	{
		component: PaidPlanPurchaseSuccessJetpackStatsNotice,
		noticeId: 'client_paid_plan_purchase_success',
		isVisibleFunc: ( { statsPurchaseSuccess }: StatsNoticeProps ) =>
			statsPurchaseSuccess === 'paid',
		disabled: false,
	},
	{
		component: FreePlanPurchaseSuccessJetpackStatsNotice,
		noticeId: 'client_free_plan_purchase_success',
		isVisibleFunc: ( { statsPurchaseSuccess }: StatsNoticeProps ) =>
			statsPurchaseSuccess === 'free',
		disabled: false,
	},
	{
		component: CommercialSiteUpgradeNotice,
		noticeId: 'commercial_site_upgrade',
		isVisibleFunc: shouldShowCommercialUpgradeNotice,
		disabled: ! config.isEnabled( 'stats/type-detection' ),
	},
	{
		component: DoYouLoveJetpackStatsNotice,
		noticeId: 'do_you_love_jetpack_stats',
		isVisibleFunc: ( {
			isOdysseyStats,
			isWpcom,
			isVip,
			isP2,
			isOwnedByTeam51,
			hasPaidStats,
			isSiteJetpackNotAtomic,
			isCommercial,
		}: StatsNoticeProps ) => {
			// Gate notices for WPCOM sites behind a flag.
			const showUpgradeNoticeForWpcomSites =
				config.isEnabled( 'stats/paid-wpcom-stats' ) && isWpcom && ! isP2 && ! isOwnedByTeam51;

			// Show the notice if the site is Jetpack or it is Odyssey Stats.
			const showUpgradeNoticeOnOdyssey = isOdysseyStats;

			const showUpgradeNoticeForJetpackNotAtomic = isSiteJetpackNotAtomic;

			return !! (
				( showUpgradeNoticeOnOdyssey ||
					showUpgradeNoticeForJetpackNotAtomic ||
					showUpgradeNoticeForWpcomSites ) &&
				// Show the notice if the site has not purchased the paid stats product.
				! hasPaidStats &&
				// Show the notice if the site is not commercial.
				( ! config.isEnabled( 'stats/type-detection' ) || ! isCommercial ) &&
				! isVip
			);
		},
		disabled: false,
	},
	{
		component: TierUpgradeNotice,
		noticeId: 'tier_upgrade',
		isVisibleFunc: ( {
			isOdysseyStats,
			isWpcom,
			isCommercialOwned,
			isSiteJetpackNotAtomic,
		}: StatsNoticeProps ) => {
			// Show the notice if the site is Jetpack or it is Odyssey Stats.
			const showTierUpgradeNoticeOnOdyssey = isOdysseyStats;
			const showTierUpgradeNoticeForJetpackNotAtomic = isSiteJetpackNotAtomic;
			// We don't show the notice for WPCOM sites for now.
			return !! (
				! isWpcom &&
				( showTierUpgradeNoticeOnOdyssey || showTierUpgradeNoticeForJetpackNotAtomic ) &&
				config.isEnabled( 'stats/tier-upgrade-slider' ) &&
				isCommercialOwned
			);
		},
		disabled: false,
	},
];

export default ALL_STATS_NOTICES;
