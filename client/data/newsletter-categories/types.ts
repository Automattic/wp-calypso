export type Category = {
	id: number;
	count: number;
	description: string;
	link: string;
	name: string;
	slug: string;
	taxonomy: string;
	parent: number;
	meta: any;
	_links: any;
};

export type NewsletterCategories = {
	enabled: boolean;
	newsletterCategories: NewsletterCategory[];
};

export type NewsletterCategory = {
	id: number;
	name: string;
	slug: string;
	description: string;
	parent: number;
	subscribed?: boolean;
};

export type NewsletterCategoriesResponse = {
	enabled: boolean;
	newsletter_categories: NewsletterCategory[];
};
