export type CourseSlug = 'blogging-quick-start';

export type VideoSlug = string;

export interface CourseVideo {
	title: string;
	description: string;
	duration_seconds: string;
	poster: string;
	url: string;
	completed_seconds: string;
}

export interface Course {
	title: string;
	slug: string;
	cta: {
		description: string;
		action: string;
		url: string;
	};
	videos: CourseVideo[];
	completions: { [ key in VideoSlug ]: boolean | boolean[] };
}
