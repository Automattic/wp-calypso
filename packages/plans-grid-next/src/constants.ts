import {
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_MONTHLY,
	TERM_TRIENNIALLY,
} from '@automattic/calypso-products';
import type { PlansIntent } from './types';

export const EFFECTIVE_TERMS_LIST = < const >[
	TERM_MONTHLY,
	TERM_ANNUALLY,
	TERM_BIENNIALLY,
	TERM_TRIENNIALLY,
];

/**
 * Intents whose feature list is curated for one product surface: a newsletter site, a P2 workspace,
 * a Woo Express trial, the hosting funnel.
 *
 * The pricing-differentiation feature lists (`useVar42NoAiFeatures`,
 * `usePlansGridRedesignFeatures`) are the default presentation for a site, so they are checked
 * before every intent branch in usePlanFeaturesForGridPlans. Without this list they would shadow
 * the curated lists entirely, leaving the choice of grid up to how old the site is -- a site with
 * the gating flag would see the differentiation list on the P2 plans page while an older workspace
 * saw the P2 one. An intent is a deliberate statement about the surface, so it wins.
 *
 * `plans-blog-onboarding` is included for completeness: no flow produces it today (see the note on
 * PlansIntent), but its branch is still wired up.
 */
export const TAILORED_FEATURE_LIST_INTENTS: readonly PlansIntent[] = [
	'plans-blog-onboarding',
	'plans-newsletter',
	'plans-p2',
	'plans-woocommerce',
	'plans-wordpress-hosting',
];

/**
 * Whether the given intent curates its own feature list, and so must not be overridden by the
 * pricing-differentiation lists.
 * @param intent The resolved plans intent, if any.
 */
export function hasTailoredFeatureList( intent?: PlansIntent | null ): boolean {
	return !! intent && TAILORED_FEATURE_LIST_INTENTS.includes( intent );
}
