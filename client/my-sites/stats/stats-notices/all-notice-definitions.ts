import config from '@automattic/calypso-config';
import { NoticeIdType } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import CommercialSiteUpgradeNotice from './commercial-site-upgrade-notice';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import FreePlanPurchaseSuccessJetpackStatsNotice from './free-plan-purchase-success-notice';
import PaidPlanPurchaseSuccessJetpackStatsNotice from './paid-plan-purchase-success-notice';
import { StatsNoticeProps } from './types';

type StatsNoticeType = {
	component: React.ComponentType< StatsNoticeProps >;
	noticeId: NoticeIdType;
	isVisibleFunc: ( options: StatsNoticeProps ) => boolean;
	disabled: boolean;
};

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
		}: StatsNoticeProps ) => {
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

			return !! (
				( showUpgradeNoticeOnOdyssey ||
					showUpgradeNoticeForJetpackNotAtomic ||
					showUpgradeNoticeForWpcomSites ) &&
				// Show the notice if the site has not purchased the paid stats product.
				! hasPaidStats
			);
		},
		disabled: false,
	},
	{
		component: CommercialSiteUpgradeNotice,
		noticeId: 'commercial_site_upgrade',
		isVisibleFunc: ( {
			isOdysseyStats,
			isWpcom,
			isVip,
			isP2,
			isOwnedByTeam51,
			hasPaidStats,
			isSiteJetpackNotAtomic,
		}: StatsNoticeProps ) => {
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

			return !! (
				( showUpgradeNoticeOnOdyssey ||
					showUpgradeNoticeForJetpackNotAtomic ||
					showUpgradeNoticeForWpcomSites ) &&
				// Show the notice if the site has not purchased the paid stats product.
				! hasPaidStats
			);
		},
		disabled: false,
	},
];

export default ALL_STATS_NOTICES;
