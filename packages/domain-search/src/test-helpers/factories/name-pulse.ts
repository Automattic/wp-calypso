import type { DomainSearchContextType } from '../../page/types';
import type {
	BundleSuggestion,
	DomainAvailability,
	NamePulseAvailabilityEntry,
	NamePulseAvailabilityResponse,
	NamePulseSuggestion,
	NamePulseSuggestionsQuery,
	NamePulseSuggestionsResponse,
} from '@automattic/api-core';

/**
 * The first entries of `GET /wpcom/v2/domains/name-pulse/tlds`, in its order.
 */
export const NAME_PULSE_TLDS_FIXTURE: string[] = [
	'blog',
	'com',
	'org',
	'net',
	'art',
	'info',
	'shop',
	'app',
	'store',
	'online',
	'site',
	'tech',
	'ca',
	'co',
	'club',
	'xyz',
	'design',
	'press',
	'io',
	'dev',
	'space',
	'live',
	'life',
	'one',
	'me',
	'cc',
	'tv',
	'pro',
	'mobi',
	'page',
	'education',
	'email',
	'news',
	'media',
	'studio',
	'video',
	'digital',
	'website',
	'network',
	'company',
];

export const buildNamePulseAvailabilityEntry = ( raw_price = 24 ): NamePulseAvailabilityEntry => ( {
	is_available: true,
	cost: `$${ raw_price }.00`,
	raw_price,
	currency_code: 'USD',
} );

export const NAME_PULSE_AVAILABILITY_FIXTURE: NamePulseAvailabilityResponse = {
	'icecream.blog': buildNamePulseAvailabilityEntry( 22 ),
	'icecream.com': buildNamePulseAvailabilityEntry( 12 ),
	'icecream.net': buildNamePulseAvailabilityEntry( 24 ),
	'icecream.org': buildNamePulseAvailabilityEntry( 18 ),
	'icecream.co': { ...buildNamePulseAvailabilityEntry( 350 ), is_premium: true },
	'icecream.io': { is_available: false },
	'icecream.site': { ...buildNamePulseAvailabilityEntry( 48 ), sale_cost: 6 },
	'icecream.online': { is_available: false },
	'icecream.tech': buildNamePulseAvailabilityEntry( 40 ),
	'icecream.store': { ...buildNamePulseAvailabilityEntry( 60 ), sale_cost: 6 },
	'icecream.dev': buildNamePulseAvailabilityEntry( 16 ),
	'icecream.xyz': { is_available: false },
};

export const buildNamePulseAvailabilityResponse = (
	domainNames: string[]
): NamePulseAvailabilityResponse =>
	Object.fromEntries(
		domainNames.map( ( name ) => [
			name,
			NAME_PULSE_AVAILABILITY_FIXTURE[ name ] ?? buildNamePulseAvailabilityEntry(),
		] )
	);

export const NAME_PULSE_SUGGESTIONS_FIXTURE: NamePulseSuggestion[] = [
	{
		domain_name: 'icecream.best',
		relevance: 0.95,
		currency_code: 'USD',
		raw_price: 48,
		sale_cost: 6,
	},
	{ domain_name: 'creamyice.com', relevance: 0.9, currency_code: 'USD', raw_price: 24 },
	{ domain_name: 'icecreamshop.com', relevance: 0.85, currency_code: 'USD', raw_price: 24 },
	{ domain_name: 'icecreamparlor.co', relevance: 0.8, currency_code: 'USD', raw_price: 30 },
	{ domain_name: 'scoops.blog', relevance: 0.75, currency_code: 'USD', raw_price: 22 },
	{
		domain_name: 'gelato.io',
		relevance: 0.7,
		currency_code: 'USD',
		raw_price: 350,
		is_premium: true,
	},
	{ domain_name: 'sundaes.net', relevance: 0.65, currency_code: 'USD', raw_price: 24 },
	{ domain_name: 'frozentreats.com', relevance: 0.6, currency_code: 'USD', raw_price: 24 },
];

export const NAME_PULSE_AI_SUGGESTIONS_FIXTURE: NamePulseSuggestion[] = [
	{ domain_name: 'thedailyscoop.blog', relevance: 0.92, currency_code: 'USD', raw_price: 22 },
	{ domain_name: 'brainfreeze.club', relevance: 0.88, currency_code: 'USD', raw_price: 14 },
	{ domain_name: 'coldcomfort.cafe', relevance: 0.84, currency_code: 'USD', raw_price: 32 },
	// Also in the keyword fixture: the two lists overlap in practice.
	{ domain_name: 'scoops.blog', relevance: 0.8, currency_code: 'USD', raw_price: 22 },
];

/**
 * Mirrors the backend: only an available `.com` anchors a bundle, with `.net`
 * and `.blog` as its companions.
 */
export const buildNamePulseBundle = ( fqdn: string ): BundleSuggestion | null => {
	if ( ! fqdn.endsWith( '.com' ) ) {
		return null;
	}

	const sld = fqdn.slice( 0, -'.com'.length );

	return {
		sld,
		domains: [
			{ domain: fqdn, role: 'primary', cost: '$13', raw_price: 13, product_slug: 'domain_reg' },
			{
				domain: `${ sld }.net`,
				role: 'companion',
				cost: '$13',
				raw_price: 13,
				product_slug: 'dotnet_domain',
			},
			{
				domain: `${ sld }.blog`,
				role: 'companion',
				cost: '$21',
				raw_price: 21,
				product_slug: 'dotblog_domain',
			},
		],
		bundle_price: 14.4,
		bundle_cost: '$14.40',
		original_price: 47,
		original_cost: '$47',
		discount_percent: 69,
		category: 'verisign_promo',
		bundle_id: `${ sld }_verisign_promo`,
		bundle_group_id: `${ sld }-group`,
		catalogue_version: '2026-09-01',
	};
};

export const withNamePulseQueries = (
	contextValue: DomainSearchContextType,
	fetchers: {
		availability: ( domainNames: string[] ) => Promise< NamePulseAvailabilityResponse >;
		suggestions: ( params: NamePulseSuggestionsQuery ) => Promise< NamePulseSuggestionsResponse >;
		tlds: () => Promise< string[] >;
		domainAvailability: ( domainName: string ) => Promise< DomainAvailability >;
		bundleForDomain?: ( fqdn: string ) => Promise< BundleSuggestion | null >;
	}
): DomainSearchContextType => ( {
	...contextValue,
	queries: {
		...contextValue.queries,
		namePulseAvailability: ( domainNames ) => ( {
			...contextValue.queries.namePulseAvailability( domainNames ),
			queryFn: () => fetchers.availability( domainNames ),
		} ),
		namePulseSuggestions: ( params ) => ( {
			...contextValue.queries.namePulseSuggestions( params ),
			queryFn: () => fetchers.suggestions( params ),
		} ),
		namePulseTlds: () => ( {
			...contextValue.queries.namePulseTlds(),
			queryFn: fetchers.tlds,
		} ),
		domainAvailability: ( domainName ) => ( {
			...contextValue.queries.domainAvailability( domainName ),
			queryFn: () => fetchers.domainAvailability( domainName ),
		} ),
		bundleForDomain: ( fqdn ) => ( {
			...contextValue.queries.bundleForDomain( fqdn ),
			queryFn: async () => ( fetchers.bundleForDomain ?? buildNamePulseBundle )( fqdn ),
		} ),
	},
} );
