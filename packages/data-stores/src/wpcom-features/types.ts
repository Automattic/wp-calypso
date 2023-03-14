import * as selectors from './selectors';
import type { SelectFromMap } from '../mapped-types';
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
	minSupportedPlan: PlanSlug;
}

export type WpcomFeaturesSelect = SelectFromMap< typeof selectors >;
