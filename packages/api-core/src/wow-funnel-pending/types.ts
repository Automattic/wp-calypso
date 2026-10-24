/**
 * An unpaid site built as a Studio preview, standing until it is bought or its review window ends.
 */
export interface WowFunnelStudioPreview {
	blog_id: number;
	site_slug: string;
}

/**
 * The user's standing Studio previews, listed apart from the pending site because a user may have
 * several and they never hold the funnel's one-site pointer. Absent when there are none.
 */
interface WowFunnelStudioPreviews {
	studio_previews?: WowFunnelStudioPreview[];
}

/**
 * The unpaid site a WoW funnel has built for the user, held until they check out.
 *
 * A user has at most one. `funnel_slug` and `funnel_args` are the run's own identity, which is
 * what re-entering the funnel needs to resume that run rather than start another.
 */
export interface WowFunnelPendingSite extends WowFunnelStudioPreviews {
	pending: true;
	blog_id: number;
	site_slug: string;
	funnel_slug: string;
	funnel_args: Record< string, string >;
}

export type WowFunnelPending =
	WowFunnelPendingSite | ( { pending: false } & WowFunnelStudioPreviews );
