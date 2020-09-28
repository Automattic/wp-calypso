/**
 * Internal dependencies
 */
import { FEATURE_SEO_PREVIEW_TOOLS, FEATURE_GOOGLE_ANALYTICS } from './constants';
import { planHasFeature } from './index';

/**
 * Type dependencies
 */
import type { Plan } from 'state/plans/types';

/**
 * Checks if a plan includes the SEO preview feature.
 *
 * @param {Plan} plan Plan to check
 * @returns {boolean} True if does
 */
export function hasPlanSeoPreviewFeature( plan: Plan ): boolean {
	return planHasFeature( plan.product_slug, FEATURE_SEO_PREVIEW_TOOLS );
}

/**
 * Checks if a plan includes the Google Analytics feature.
 *
 * @param {Plan} plan Plan to check
 * @returns {boolean} True if does
 */
export function hasPlanGoogleAnalyticsFeature( plan: Plan ): boolean {
	return planHasFeature( plan.product_slug, FEATURE_GOOGLE_ANALYTICS );
}
