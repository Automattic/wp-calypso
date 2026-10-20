/**
 * The unpaid site a WoW funnel has built for the user, held until they check out.
 *
 * A user has at most one. `funnel_slug` and `funnel_args` are the run's own identity, which is
 * what re-entering the funnel needs to resume that run rather than start another.
 */
export interface WowFunnelPendingSite {
	pending: true;
	blog_id: number;
	site_slug: string;
	funnel_slug: string;
	funnel_args: Record< string, string >;
}

export type WowFunnelPending = WowFunnelPendingSite | { pending: false };
