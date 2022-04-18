import { translate } from 'i18n-calypso';

export type Category = {
	name: string;
	slug: string;
	tags: string[];
	description?: string;
	icon?: string;
	separator?: boolean;
};

const ALL_CATEGORIES: Record< string, Category > = {
	discover: { name: translate( 'Discover', { textOnly: true } ), slug: 'discover', tags: [] },
	// 'top-free': {
	// 	name: translate( 'Top free plugins', { textOnly: true } ),
	// 	slug: 'top-free',
	// 	tags: [],
	// },
	// 'top-paid': {
	// 	name: translate( 'Top premium plugins', { textOnly: true } ),
	// 	slug: 'top-paid',
	// 	tags: [],
	// },
	// editors: { name: translate( 'Editor’s pick', { textOnly: true } ), slug: 'editors', tags: [] },
	// separator: { name: '', separator: true, slug: '', tags: [] },
	// all: { name: translate( 'All Categories', { textOnly: true } ), slug: 'all', tags: [] },
	analytics: {
		name: translate( 'Analytics', { textOnly: true } ),
		description: translate( 'Analytics', { textOnly: true } ),
		icon: 'grid',
		slug: 'analytics',
		tags: [ 'analytics' ],
	},
	business: {
		name: translate( 'Business', { textOnly: true } ),
		description: translate( 'Business', { textOnly: true } ),
		icon: 'grid',
		slug: 'business',
		tags: [ 'business' ],
	},
	customer: {
		name: translate( 'Customer Service', { textOnly: true } ),
		description: translate( 'Customer Service', { textOnly: true } ),
		icon: 'grid',
		slug: 'customer',
		tags: [ 'customer-service' ],
	},
	design: {
		name: translate( 'Design', { textOnly: true } ),
		description: translate( 'Design', { textOnly: true } ),
		icon: 'grid',
		slug: 'design',
		tags: [ 'design' ],
	},
	ecommerce: {
		name: translate( 'Ecommerce', { textOnly: true } ),
		description: translate( 'Ecommerce', { textOnly: true } ),
		icon: 'grid',
		slug: 'ecommerce',
		tags: [ 'ecommerce', 'woocommerce' ],
	},
	education: {
		name: translate( 'Education', { textOnly: true } ),
		description: translate( 'Education', { textOnly: true } ),
		icon: 'grid',
		slug: 'education',
		tags: [ 'education' ],
	},
	finance: {
		name: translate( 'Finance', { textOnly: true } ),
		description: translate( 'Finance', { textOnly: true } ),
		icon: 'grid',
		slug: 'finance',
		tags: [ 'finance' ],
	},
	marketing: {
		name: translate( 'Marketing', { textOnly: true } ),
		description: translate( 'Marketing', { textOnly: true } ),
		icon: 'grid',
		slug: 'marketing',
		tags: [ 'marketing' ],
	},
	seo: {
		name: translate( 'Search Optimization', { textOnly: true } ),
		description: translate( 'Search Optimization', { textOnly: true } ),
		icon: 'grid',
		slug: 'seo',
		tags: [ 'seo' ],
	},
	photo: {
		name: translate( 'Photo & Video', { textOnly: true } ),
		description: translate( 'Photo & Video', { textOnly: true } ),
		icon: 'grid',
		slug: 'photo',
		tags: [ 'photo', 'video', 'media' ],
	},
	social: {
		name: translate( 'Social', { textOnly: true } ),
		description: translate( 'Social', { textOnly: true } ),
		icon: 'grid',
		slug: 'social',
		tags: [ 'social', 'facebook', 'twitter', 'instagram', 'tiktok', 'youtube', 'pinterest' ],
	},
	widgets: {
		name: translate( 'Widgets', { textOnly: true } ),
		description: translate( 'Widgets', { textOnly: true } ),
		icon: 'grid',
		slug: 'widgets',
		tags: [ 'widgets' ],
	},
	email: {
		name: translate( 'Email', { textOnly: true } ),
		description: translate( 'Email', { textOnly: true } ),
		icon: 'grid',
		slug: 'email',
		tags: [ 'email' ],
	},
	security: {
		name: translate( 'Security', { textOnly: true } ),
		description: translate( 'Security', { textOnly: true } ),
		icon: 'grid',
		slug: 'security',
		tags: [ 'security' ],
	},
	posts: {
		name: translate( 'Posts & Posting', { textOnly: true } ),
		description: translate( 'Posts & Posting', { textOnly: true } ),
		icon: 'grid',
		slug: 'posts',
		tags: [ 'posts', 'post', 'page', 'pages' ],
	},
};

export function getAllCategoriesRecords() {
	return ALL_CATEGORIES;
}

export function getTagsFromCategory( categorySlug: string ) {
	return ALL_CATEGORIES[ categorySlug ]?.tags;
}

export function getCategoryUrl( category: Category, siteSlug?: string ) {
	return category.slug !== 'discover' && category.slug !== 'all'
		? `/plugins/${ category.slug }/${ siteSlug || '' }`
		: `/plugins/${ siteSlug || '' }`;
}

export function getCategoriesWithTags() {
	return Object.values( ALL_CATEGORIES ).filter( ( category ) => {
		return category.tags.length > 0;
	} );
}
