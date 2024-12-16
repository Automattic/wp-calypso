import type { PlansIntent } from '@automattic/plans-grid-next';

export type SurveyData = {
	'what-are-your-goals': string[];
	'what-brings-you-to-wordpress': string[];
};

export type SegmentedIntent = {
	segmentSlug: PlansIntent | undefined;
	segment: string;
};
