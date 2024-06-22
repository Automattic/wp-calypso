import config from '@automattic/calypso-config';
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
		isVisibleFunc: shouldShowCommercialSiteUpgradeNotice,
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
				config.isEnabled( 'stats/tier-upgrade-slider' ) &&
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

function shouldShowCommercialSiteUpgradeNotice( {
	isOdysseyStats,
	isWpcom,
	isVip,
	isP2,
	isOwnedByTeam51,
	hasPaidStats,
	isSiteJetpackNotAtomic,
	isCommercial,
	hasPWYWPlanOnly,
}: StatsNoticeProps ) {
	// Log all the things!
	// eslint-disable-next-line no-console, prefer-rest-params
	console.log( 'args: ', arguments );

	const showUpgradeNoticeForWpcomSites = isWpcom && ! isP2 && ! isOwnedByTeam51;

	// Show the notice if the site is Jetpack or it is Odyssey Stats.
	const showUpgradeNoticeOnOdyssey = isOdysseyStats;

	const showUpgradeNoticeForJetpackNotAtomic = isSiteJetpackNotAtomic;

	// Test specific to self-hosted sites with PWYW plans.
	// They should see the upgrade notice!
	if ( showUpgradeNoticeOnOdyssey || showUpgradeNoticeForJetpackNotAtomic ) {
		if ( isCommercial && hasPWYWPlanOnly ) {
			return true;
		}
	}

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

export default ALL_STATS_NOTICES;
