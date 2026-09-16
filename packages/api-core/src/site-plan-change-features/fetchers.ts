import { wpcom } from '../wpcom-fetcher';

/**
 * A feature the site would lose by moving to the target plan.
 *
 * `in_use` is `null` when usage could not be determined, which callers must treat as "warn": the
 * site may well be using it.
 */
export type PlanChangeLostFeature = {
	feature: string;
	in_use: boolean | null;
};

export type SitePlanChangeFeaturesResponse = {
	/**
	 * Whether the site is still on the pre-2026 feature gating. False means a plan change costs it
	 * nothing, and the rest of the response is empty.
	 */
	is_legacy_gating_site: boolean;
	lost: PlanChangeLostFeature[];
	gained: string[];
	/**
	 * True when the target plan would remove something the site uses, or something that could not be
	 * checked — i.e. exactly when a warning is due.
	 */
	needs_warning: boolean;
};

/**
 * What one plan change would cost a site still on the pre-2026 feature gating.
 *
 * Those sites hold the union of the old and new feature sets until they change plan, so an upgrade
 * can remove a feature. Scoped to a single target plan: ask about the plan being sold.
 */
export async function fetchSitePlanChangeFeatures(
	siteId: number,
	targetProductSlug: string
): Promise< SitePlanChangeFeaturesResponse > {
	return await wpcom.req.get(
		{
			path: `/sites/${ siteId }/feature-gating-2026/plan-change`,
			apiNamespace: 'wpcom/v2',
		},
		{ target_product_slug: targetProductSlug }
	);
}
