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
	hideInitialQuery?: boolean;
};
