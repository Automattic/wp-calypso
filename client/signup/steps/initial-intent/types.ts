export type SurveyData = {
	'what-are-your-goals': string[];
	'what-brings-you-to-wordpress': string[];
};

export type SegmentedIntent = {
	segmentSlug: string | undefined;
	segment: string;
};
