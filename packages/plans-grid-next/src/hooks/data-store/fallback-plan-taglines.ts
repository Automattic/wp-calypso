import {
	PLAN_ENTERPRISE_GRID_WPCOM,
	PLAN_WOOEXPRESS_PLUS,
	PLAN_P2_FREE,
} from '@automattic/calypso-products';
import type { TranslateResult } from 'i18n-calypso';

/**
 * Taglines for the handful of plans the `/plans` endpoint does not provide a
 * tagline for: non-purchasable contact-sales plans (Enterprise, Woo Express
 * Plus) and the relabeled P2 Free (which shares WP.com Free's product id, so it
 * cannot have a distinct server tagline).
 *
 * This list is intentionally separate from the plan definitions in
 * `@automattic/calypso-products` and is used only as a fallback when the server
 * does not supply a tagline. Prefer the server-provided tagline; only add to
 * this list for plans the server genuinely cannot describe.
 */
export default function getFallbackPlanTagline(
	planSlug: string,
	translate: ( text: string ) => TranslateResult
): TranslateResult {
	switch ( planSlug ) {
		case PLAN_WOOEXPRESS_PLUS:
			return translate(
				'For fast-growing businesses that need access to the most powerful tools.'
			);
		case PLAN_ENTERPRISE_GRID_WPCOM:
			return translate( 'Level up to bespoke Enterprise-grade performance and security.' );
		case PLAN_P2_FREE:
			return translate(
				'All the features needed to share, discuss, review, and collaborate with your team in one spot, without interruptions.'
			);
		default:
			return '';
	}
}
