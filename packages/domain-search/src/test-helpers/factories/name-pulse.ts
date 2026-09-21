import type { DomainSearchContextType } from '../../page/types';
import type {
	DomainAvailability,
	NamePulseAvailabilityEntry,
	NamePulseAvailabilityResponse,
	NamePulseSuggestion,
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

export const withNamePulseQueries = (
	contextValue: DomainSearchContextType,
	fetchers: {
		availability: ( domainNames: string[] ) => Promise< NamePulseAvailabilityResponse >;
		suggestions: () => Promise< NamePulseSuggestionsResponse >;
		tlds: () => Promise< string[] >;
		domainAvailability: ( domainName: string ) => Promise< DomainAvailability >;
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
			queryFn: fetchers.suggestions,
		} ),
		namePulseTlds: () => ( {
			...contextValue.queries.namePulseTlds(),
			queryFn: fetchers.tlds,
		} ),
		domainAvailability: ( domainName ) => ( {
			...contextValue.queries.domainAvailability( domainName ),
			queryFn: () => fetchers.domainAvailability( domainName ),
		} ),
	},
} );
