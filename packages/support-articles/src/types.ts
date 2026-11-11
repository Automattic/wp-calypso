export interface LessonNavigationLink {
	url: string;
	title: string;
}

export interface LessonNavigation {
	next?: LessonNavigationLink;
	previous?: LessonNavigationLink;
}

/** "Was this helpful?" answer. The values match the Tracks event and the legacy Crowdsignal poll: 1 = yes, 2 = no. */
export type ArticleRating = 1 | 2;

export interface PostObject {
	content: string;
	title: string;
	URL: string;
	ID: number;
	site_ID: number;
	slug: string;
	source?: string;
	lesson_navigation?: LessonNavigation;
	/** Rating the current user gave this article. Only present for logged-in users, since ratings are stored per user. */
	user_rating?: ArticleRating | null;
}

export interface ArticleContentProps {
	post?: PostObject;
	isLoading?: boolean;
	currentSiteDomain?: string;
	isEligibleForChat: boolean;
	forceEmailSupport: boolean;
}
