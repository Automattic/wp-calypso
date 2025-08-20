export interface DomainSuggestion {
	domain_name: string;
	cost: string;
	product_slug: string;
	is_premium?: boolean;
}

const fetchDomainSuggestions = async (): Promise< DomainSuggestion[] > => {
	await new Promise( ( resolve ) => setTimeout( resolve, Math.random() * 3_000 ) );

	return [
		{
			domain_name: 'example.com',
			cost: '$10',
			product_slug: 'domain_reg',
		},
		{
			domain_name: 'example.org',
			cost: '$18',
			product_slug: 'dotorg_domain',
			is_premium: true,
		},
		{
			domain_name: 'example.net',
			cost: '$10',
			product_slug: 'dotnet_domain',
			is_premium: true,
		},
		{
			domain_name: 'recommended-example.com',
			cost: '$10',
			product_slug: 'domain_reg',
		},
		{
			domain_name: 'best-alternative-example.org',
			cost: '$10',
			product_slug: 'dotorg_domain',
		},
	];
};

export const domainSuggestionsQuery = ( query: string ) => ( {
	queryKey: [ 'domain-suggestions', query ],
	queryFn: () => fetchDomainSuggestions(),
} );
