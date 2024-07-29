import { NoticeIdType } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import CommercialSiteUpgradeNotice from './commercial-site-upgrade-notice';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import FreePlanPurchaseSuccessJetpackStatsNotice from './free-plan-purchase-success-notice';
import GDPRCookieConsentNotice from './gdpr-cookie-consent-notice';
import PaidPlanPurchaseSuccessJetpackStatsNotice from './paid-plan-purchase-success-notice';
import TierUpgradeNotice from './tier-upgrade-notice';
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
			isCommercial,
			hasPWYWPlanOnly,
			showPaywallNotice,
		}: StatsNoticeProps ) => {
			// Show the notice only if the site is commercial.
			if ( ! isCommercial ) {
				return false;
			}

			if ( isVip ) {
				return false;
			}

			// Show the upgrade notice with the coming paywall communication.
			if ( showPaywallNotice ) {
				return true;
			}

			const showUpgradeNoticeForWpcomSites = isWpcom && ! isP2 && ! isOwnedByTeam51;
			const showUpgradeNoticeForJetpackSites = isOdysseyStats || isSiteJetpackNotAtomic;

			// Test specific to commercial self-hosted sites with PWYW plans.
			if ( showUpgradeNoticeForJetpackSites && hasPWYWPlanOnly ) {
				return true;
			}

			return !! (
				( showUpgradeNoticeForJetpackSites || showUpgradeNoticeForWpcomSites ) &&
				// Show the notice if the site has not purchased the paid stats product.
				! hasPaidStats &&
				! isVip
			);
		},
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
			isCommercial,
		}: StatsNoticeProps ) => {
			const showUpgradeNoticeForWpcomSites = isWpcom && ! isP2 && ! isOwnedByTeam51;

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
				! isCommercial &&
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
				isCommercialOwned
			);
		},
		disabled: false,
	},
	{
		component: GDPRCookieConsentNotice,
		noticeId: 'gdpr_cookie_consent',
		isVisibleFunc: ( { isOdysseyStats } ) => {
			// Only show the notice for Odyssey Stats since the plugin option is stored locally.
			return isOdysseyStats;
		},
		disabled: false,
	},
];

export default ALL_STATS_NOTICES;
