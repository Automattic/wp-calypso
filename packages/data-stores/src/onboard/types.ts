import type { RequestCartProduct } from '@automattic/shopping-cart';

export type DomainSuggestion = {
	is_free: boolean;
	domain_name: string;
	isRecommended: boolean;
	isBestAlternative: boolean;
	is_premium?: boolean;
	product_slug: string;
};

export type DomainForm = {
	lastQuery?: string;
	subdomainSearchResults?: DomainSuggestion[] | null;
	loadingResults?: boolean;
	searchResults?: DomainSuggestion[] | null;
};

export type CartItem = Partial< RequestCartProduct > &
	Pick< RequestCartProduct, 'product_slug' | 'extra' >;
