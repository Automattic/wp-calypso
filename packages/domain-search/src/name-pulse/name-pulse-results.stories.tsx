import { DomainAvailabilityStatus } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { getTld } from '../helpers';
import { DomainSearchContext, useDomainSearchContextValue } from '../page/context';
import { NAME_PULSE_TLDS_FIXTURE } from '../test-helpers/factories/name-pulse-tlds';
import { NamePulseResults } from '.';
import type { DomainSearchCart, SelectedDomain } from '../page/types';
import type {
	DomainAvailability,
	NamePulseAvailabilityEntry,
	NamePulseSuggestion,
} from '@automattic/api-core';
import type { Meta } from '@storybook/react';

import '../page/style.scss';

const queryClient = new QueryClient( {
	defaultOptions: { queries: { retry: false } },
} );

const available = ( raw_price = 24 ): NamePulseAvailabilityEntry => ( {
	is_available: true,
	cost: `$${ raw_price }.00`,
	raw_price,
	currency_code: 'USD',
	product_slug: 'domain_reg',
} );

const AVAILABILITY: Record< string, NamePulseAvailabilityEntry > = {
	'icecream.blog': available( 22 ),
	'icecream.com': available( 12 ),
	'icecream.net': available( 24 ),
	'icecream.org': available( 18 ),
	'icecream.co': { ...available( 350 ), is_premium: true },
	'icecream.io': { is_available: false },
	'icecream.site': { ...available( 48 ), sale_cost: 6 },
	'icecream.online': { is_available: false },
	'icecream.tech': available( 40 ),
	'icecream.store': { ...available( 60 ), sale_cost: 6 },
	'icecream.dev': available( 16 ),
	'icecream.xyz': { is_available: false },
	'icecream.ai': { ...available( 90 ), is_premium: true },
};

const SUGGESTIONS: NamePulseSuggestion[] = [
	{
		domain_name: 'icecream.best',
		relevance: 0.95,
		vendor: 'verisign',
		raw_price: 48,
		sale_cost: 6,
	},
	{ domain_name: 'creamyice.com', relevance: 0.9, vendor: 'domainsbot', raw_price: 24 },
	{ domain_name: 'icecreamshop.com', relevance: 0.85, vendor: 'verisign', raw_price: 24 },
	{ domain_name: 'icecreamparlor.co', relevance: 0.8, vendor: 'verisign', raw_price: 30 },
	{ domain_name: 'scoops.blog', relevance: 0.75, vendor: 'domainsbot', raw_price: 22 },
	{
		domain_name: 'gelato.io',
		relevance: 0.7,
		vendor: 'verisign',
		raw_price: 350,
		is_premium: true,
	},
	{ domain_name: 'sundaes.net', relevance: 0.65, vendor: 'domainsbot', raw_price: 24 },
	{ domain_name: 'frozentreats.com', relevance: 0.6, vendor: 'verisign', raw_price: 24 },
];

/**
 * Rows omitted from the bulk response stay WAITING (skeleton); a single-name
 * batch is rejected so that row lands in the UNKNOWN ("Couldn’t check") state.
 */
const OMITTED = new Set( [ 'icecream.app', 'icecream.info' ] );
const FAILING = 'icecream.app';

const toRealtimeStatus = ( entry: NamePulseAvailabilityEntry ) => {
	if ( ! entry.is_available ) {
		return DomainAvailabilityStatus.NOT_AVAILABLE;
	}

	return entry.is_premium
		? DomainAvailabilityStatus.AVAILABLE_PREMIUM
		: DomainAvailabilityStatus.AVAILABLE;
};

const toRealtimeAvailability = ( domainName: string ): DomainAvailability => {
	const entry = AVAILABILITY[ domainName ] ?? available();

	return {
		domain_name: domainName,
		tld: getTld( domainName ),
		status: toRealtimeStatus( entry ),
		mappable: 'mappable',
		supports_privacy: true,
		root_domain_provider: 'wpcom',
		cost: entry.cost ?? '',
		raw_price: entry.raw_price,
		sale_cost: entry.sale_cost,
		currency_code: 'USD',
		product_slug: 'domain_reg',
		product_id: 6,
	};
};

const useStoryCart = (): DomainSearchCart => {
	const [ items, setItems ] = useState< SelectedDomain[] >( [] );
	const total = items.reduce(
		( sum, item ) => sum + parseFloat( ( item.salePrice ?? item.price ).replace( '$', '' ) ),
		0
	);

	return {
		items,
		total: `$${ total }`,
		hasItem: ( domainName ) =>
			items.some( ( item ) => `${ item.domain }.${ item.tld }` === domainName ),
		onAddItem: async ( item ) => {
			const tld = getTld( item.domain_name );

			setItems( ( current ) => [
				...current,
				{
					uuid: item.domain_name,
					domain: item.domain_name.slice( 0, -( tld.length + 1 ) ),
					tld,
					price: item.cost,
					salePrice: item.sale_cost ? `$${ item.sale_cost }` : undefined,
				},
			] );
		},
		onRemoveItem: async ( uuid ) => {
			setItems( ( current ) => current.filter( ( item ) => item.uuid !== uuid ) );
		},
	};
};

const StoryDomainSearch = ( { query }: { query: string } ) => {
	const cart = useStoryCart();
	const [ currentQuery, setCurrentQuery ] = useState( query );
	const contextValue = useDomainSearchContextValue( {
		cart,
		query: currentQuery,
		config: { showNamePulseSearch: true },
		events: { onQueryChange: setCurrentQuery },
	} );

	return (
		<QueryClientProvider client={ queryClient }>
			<DomainSearchContext.Provider
				value={ {
					...contextValue,
					queries: {
						...contextValue.queries,
						namePulseAvailability: ( domainNames ) => ( {
							...contextValue.queries.namePulseAvailability( domainNames ),
							queryFn: async () => {
								await new Promise( ( resolve ) => setTimeout( resolve, 600 ) );

								if ( domainNames.length === 1 && domainNames[ 0 ] === FAILING ) {
									throw new Error( 'Availability check failed' );
								}

								return Object.fromEntries(
									domainNames
										.filter( ( name ) => ! OMITTED.has( name ) )
										.map( ( name ) => [ name, AVAILABILITY[ name ] ?? available() ] )
								);
							},
						} ),
						namePulseSuggestions: ( params ) => ( {
							...contextValue.queries.namePulseSuggestions( params ),
							queryFn: async () => {
								await new Promise( ( resolve ) => setTimeout( resolve, 1200 ) );

								return { suggestions: SUGGESTIONS, errors: [] };
							},
						} ),
						namePulseTlds: () => ( {
							...contextValue.queries.namePulseTlds(),
							queryFn: async () => {
								await new Promise( ( resolve ) => setTimeout( resolve, 400 ) );

								return NAME_PULSE_TLDS_FIXTURE;
							},
						} ),
						domainAvailability: ( domainName ) => ( {
							...contextValue.queries.domainAvailability( domainName ),
							queryFn: async () => toRealtimeAvailability( domainName ),
						} ),
					},
				} }
			>
				<div className="domain-search" style={ { padding: '2rem 1rem' } }>
					<NamePulseResults />
				</div>
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};

const meta: Meta< typeof StoryDomainSearch > = {
	title: 'NamePulse/Results',
	component: StoryDomainSearch,
};

export default meta;

export const SingleWord = () => <StoryDomainSearch query="icecream" />;

export const MultiWord = () => <StoryDomainSearch query="ice cream" />;
