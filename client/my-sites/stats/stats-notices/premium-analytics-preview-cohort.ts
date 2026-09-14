import { isEnabled } from '@automattic/calypso-config';
import { StatsNoticeProps } from './types';

export const PREMIUM_ANALYTICS_PREVIEW_ATOMIC_FLAG = 'stats/premium-analytics-preview-atomic';
export const PREMIUM_ANALYTICS_PREVIEW_FLAG = 'stats/premium-analytics-preview';

/** The dashboard page, relative to the site's wp-admin. Where accepting the invitation lands. */
export const PREMIUM_ANALYTICS_PAGE_PATH = 'admin.php?page=jetpack-premium-analytics-wp-admin';

type PreviewCohortSignals = Pick<
	StatsNoticeProps,
	| 'isWpcom'
	| 'isAtomic'
	| 'isVip'
	| 'isP2'
	| 'canManageOptions'
	| 'hasCommercialStats'
	| 'premiumAnalyticsDashboardUrl'
>;

/**
 * Everything the preview invitation asks of a site, bar the dashboard's own status.
 *
 * Shared with the notices host, which needs the same answer one step earlier: it decides whether to
 * read that status at all, and the whole notices area waits on the read. Asking a different
 * question there would leave sites that can never be invited - VIP and P2 among them - holding
 * their own upsell back for an answer nothing will use.
 *
 * `isWpcom` is a rollout boundary rather than eligibility: Simple and Atomic go first, and
 * self-hosted Jetpack sites join by deleting that one clause.
 * Atomic is held until 16.3-a.1 reaches WP Cloud, with the Atomic flag allowing
 * Automatticians to test on Atomic meanwhile.
 *
 * `premiumAnalyticsDashboardUrl` is null when the site record carries no `admin_url`. Accepting
 * would then switch the dashboard on and drop the customer on a 404, so such a site is not
 * invited - and, being part of eligibility rather than the render, it never wins the conflict
 * group and leaves an empty slot where an upsell or the JITM would have been.
 */
export default function isPremiumAnalyticsPreviewCohort( {
	isWpcom,
	isAtomic,
	isVip,
	isP2,
	canManageOptions,
	hasCommercialStats,
	premiumAnalyticsDashboardUrl,
}: PreviewCohortSignals ) {
	return !! (
		isWpcom &&
		canManageOptions &&
		hasCommercialStats &&
		premiumAnalyticsDashboardUrl &&
		! isVip &&
		! isP2 &&
		( ! isAtomic || isEnabled( PREMIUM_ANALYTICS_PREVIEW_ATOMIC_FLAG ) )
	);
}
