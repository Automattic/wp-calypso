import { StatsNoticeProps } from './types';

type PreviewCohortSignals = Pick<
	StatsNoticeProps,
	'isWpcom' | 'isVip' | 'isP2' | 'canManageOptions' | 'hasCommercialStats'
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
 */
export default function isPremiumAnalyticsPreviewCohort( {
	isWpcom,
	isVip,
	isP2,
	canManageOptions,
	hasCommercialStats,
}: PreviewCohortSignals ) {
	return !! ( isWpcom && canManageOptions && hasCommercialStats && ! isVip && ! isP2 );
}
