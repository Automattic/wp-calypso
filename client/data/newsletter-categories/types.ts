export type NewsletterCategoryQueryProps = {
	blogId: number;
};

export type NewsletterCategoryResponse = {
	newsletter_categories: NewsletterCategory[];
};

export type NewsletterCategories = {
	newsletterCategories: NewsletterCategory[];
};

export type NewsletterCategory = {
	id: number;
	name: string;
	slug: string;
	description: string;
	parent: number;
};
