import { isEnabled } from '@automattic/calypso-config';
import { NoticeIdType } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import { COMMERCIAL_PAYWALL_KILLED } from 'calypso/state/stats/plan-usage/constants';
import CommercialSiteUpgradeNotice from './commercial-site-upgrade-notice';
import DoYouLoveJetpackStatsNotice from './do-you-love-jetpack-stats-notice';
import FreePlanPurchaseSuccessJetpackStatsNotice from './free-plan-purchase-success-notice';
import FreeSiteUpgradeNotice from './free-site-upgrade-notice';
import GDPRCookieConsentNotice from './gdpr-cookie-consent-notice';
import PaidPlanPurchaseSuccessJetpackStatsNotice from './paid-plan-purchase-success-notice';
import isPremiumAnalyticsPreviewCohort, {
	PREMIUM_ANALYTICS_PREVIEW_FLAG,
} from './premium-analytics-preview-cohort';
import PremiumAnalyticsPreviewNotice from './premium-analytics-preview-notice';
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
		component: PremiumAnalyticsPreviewNotice,
		noticeId: 'premium_analytics_preview',
		// Eligibility lives in `isPremiumAnalyticsPreviewCohort`, shared with the notices host so
		// it is resolved before this notice can win its conflict group - a winner that then renders
		// nothing suppresses the rest of the group and the JITM for an empty slot.
		// `isPremiumAnalyticsEnabled` is compared to false rather than negated: undefined means the
		// site never reported the setting, which must not read as "go ahead and offer it".
		isVisibleFunc: ( options: StatsNoticeProps ) =>
			isPremiumAnalyticsPreviewCohort( options ) && options.isPremiumAnalyticsEnabled === false,
		disabled: ! isEnabled( PREMIUM_ANALYTICS_PREVIEW_FLAG ),
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
			if ( ! isCommercial || isVip ) {
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

			return (
				!! ( showUpgradeNoticeForJetpackSites || showUpgradeNoticeForWpcomSites ) && ! hasPaidStats
			);
		},
		// The two legacy upsell notices and their `free_site_upgrade` successor are enabled on
		// opposite sides of the commercial paywall kill switch, so a single flip restores the
		// pre-kill notice behaviour, lockout banner included.
		disabled: COMMERCIAL_PAYWALL_KILLED,
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
			hasSignificantViews,
			hasWpcomUpsell,
		}: StatsNoticeProps ) => {
			// Disable this notice if the full-size upsell is visible.
			const showUpgradeNoticeForWpcomSites =
				isWpcom && ! hasWpcomUpsell && ! isP2 && ! isOwnedByTeam51 && hasSignificantViews;

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
		disabled: COMMERCIAL_PAYWALL_KILLED,
	},
	{
		component: FreeSiteUpgradeNotice,
		noticeId: 'free_site_upgrade',
		// With the commercial paywall gone, commercial-flagged sites are upsold under
		// the same rules as everyone else — being commercial no longer matters here.
		isVisibleFunc: ( {
			isOdysseyStats,
			isWpcom,
			isVip,
			isP2,
			isOwnedByTeam51,
			hasPaidStats,
			isSiteJetpackNotAtomic,
			hasSignificantViews,
			hasWpcomUpsell,
		}: StatsNoticeProps ) => {
			// Disable this notice if the full-size upsell is visible.
			const showUpgradeNoticeForWpcomSites =
				isWpcom && ! hasWpcomUpsell && ! isP2 && ! isOwnedByTeam51 && hasSignificantViews;

			// Show the notice if the site is Jetpack or it is Odyssey Stats.
			const showUpgradeNoticeOnOdyssey = isOdysseyStats;
			const showUpgradeNoticeForJetpackNotAtomic = isSiteJetpackNotAtomic;

			return !! (
				( showUpgradeNoticeOnOdyssey ||
					showUpgradeNoticeForJetpackNotAtomic ||
					showUpgradeNoticeForWpcomSites ) &&
				// Show the notice if the site has not purchased the paid stats product.
				! hasPaidStats &&
				! isVip
			);
		},
		disabled: ! COMMERCIAL_PAYWALL_KILLED,
	},
	{
		component: TierUpgradeNotice,
		noticeId: 'tier_upgrade',
		isVisibleFunc: ( {
			isOdysseyStats,
			isWpcom,
			supportCommercialUse,
			isSiteJetpackNotAtomic,
			isNearLimit,
		}: StatsNoticeProps ) => {
			// Show the notice if the site is Jetpack or it is Odyssey Stats.
			const showTierUpgradeNoticeOnOdyssey = isOdysseyStats;
			const showTierUpgradeNoticeForJetpackNotAtomic = isSiteJetpackNotAtomic;
			// We don't show the notice for WPCOM sites for now.
			// `supportCommercialUse` covers both a standalone Stats purchase and commercial access
			// granted by a bundled plan (e.g. Jetpack Complete) — either way the site has a views
			// limit that it can be near/over.
			return !! (
				! isWpcom &&
				( showTierUpgradeNoticeOnOdyssey || showTierUpgradeNoticeForJetpackNotAtomic ) &&
				supportCommercialUse &&
				isNearLimit
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
