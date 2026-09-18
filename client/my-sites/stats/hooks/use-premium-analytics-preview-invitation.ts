import usePremiumAnalyticsPreviewCohort from './use-premium-analytics-preview-cohort';
import usePremiumAnalyticsStatusQuery from './use-premium-analytics-status-query';

/**
 * Whether classic Stats should offer this site the new Traffic tab, and where that leads.
 *
 * Unlike the banner, this does not ask the notices endpoint: a dismissal or a postponement
 * hides the banner, and this is the way in that has to outlive it. Only exactly `false` counts
 * as an invitation - `undefined` means the site never reported the setting.
 * @param siteId Site to ask about.
 */
export default function usePremiumAnalyticsPreviewInvitation( siteId: number | null ) {
	const { canBeInvited, premiumAnalyticsDashboardUrl } = usePremiumAnalyticsPreviewCohort( siteId );
	const { data: isPremiumAnalyticsEnabled } = usePremiumAnalyticsStatusQuery(
		siteId,
		canBeInvited
	);

	return {
		isInvited: canBeInvited && isPremiumAnalyticsEnabled === false,
		dashboardUrl: premiumAnalyticsDashboardUrl,
	};
}
