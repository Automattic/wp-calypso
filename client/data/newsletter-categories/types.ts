export type NewsletterCategories = {
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
