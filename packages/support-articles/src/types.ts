export interface PostObject {
	content: string;
	title: string;
	URL: string;
	ID: number;
	site_ID: number;
	slug: string;
}

export interface ArticleContentProps {
	post?: PostObject;
	isLoading?: boolean;
	currentSiteDomain?: string;
	isEligibleForChat: boolean;
	forceEmailSupport: boolean;
}
