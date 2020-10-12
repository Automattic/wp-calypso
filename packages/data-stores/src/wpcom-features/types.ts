/**
 * Internal dependencies
 */
import type { PlanSlug } from '../plans';

export type FeatureId =
	| 'domain'
	| 'store'
	| 'seo'
	| 'plugins'
	| 'ad-free'
	| 'image-storage'
	| 'video-storage'
	| 'support';

export interface Feature {
	id: FeatureId;
	name: string;
	description: string;
	minSupportedPlan: PlanSlug;
}
