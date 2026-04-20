export interface LessonNavigationLink {
	url: string;
	title: string;
}

export interface LessonNavigation {
	next?: LessonNavigationLink;
	previous?: LessonNavigationLink;
}

export interface PostObject {
	content: string;
	title: string;
	URL: string;
	ID: number;
	site_ID: number;
	slug: string;
	source?: string;
	lesson_navigation?: LessonNavigation;
}

export interface ArticleContentProps {
	post?: PostObject;
	isLoading?: boolean;
	currentSiteDomain?: string;
	isEligibleForChat: boolean;
	forceEmailSupport: boolean;
}
