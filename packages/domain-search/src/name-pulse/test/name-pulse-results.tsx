/**
 * @jest-environment jsdom
 */
import { DomainAvailabilityStatus } from '@automattic/api-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NamePulseResults } from '..';
import { DomainSearchContext, useDomainSearchContextValue } from '../../page/context';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { buildCart } from '../../test-helpers/factories/cart';
import { queryClient } from '../../test-helpers/renderer';
import { NAME_PULSE_INITIAL_CHECK_SINGLE_WORD, NAME_PULSE_PAGE_SIZE } from '../helpers';
import type { DomainSearchCart } from '../../page/types';
import type {
	NamePulseAvailabilityEntry,
	NamePulseSuggestion,
	NamePulseSuggestionsResponse,
} from '@automattic/api-core';

const available = ( raw_price = 24 ): NamePulseAvailabilityEntry => ( {
	is_available: true,
	cost: `$${ raw_price }.00`,
	raw_price,
	currency_code: 'USD',
} );

const AVAILABILITY: Record< string, NamePulseAvailabilityEntry > = {
	'icecream.co': { ...available( 350 ), is_premium: true },
	'icecream.online': { ...available( 48 ), sale_cost: 6 },
	'icecream.io': { is_available: false },
};

const SUGGESTIONS: NamePulseSuggestion[] = [
	{ domain_name: 'icecream.best', relevance: 0.9, vendor: 'verisign', raw_price: 48, sale_cost: 6 },
	{ domain_name: 'creamyice.com', relevance: 0.8, vendor: 'domainsbot', raw_price: 24 },
];

const NamePulseTestSearch = ( {
	query,
	cart = buildCart(),
	availabilityRequests = [],
	suggestionsResponse = { suggestions: SUGGESTIONS, errors: [] },
}: {
	query: string;
	cart?: DomainSearchCart;
	availabilityRequests?: string[][];
	suggestionsResponse?: NamePulseSuggestionsResponse;
} ) => {
	const contextValue = useDomainSearchContextValue( {
		cart,
		query,
		config: { showNamePulseSearch: true },
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
								availabilityRequests.push( domainNames );

								return Object.fromEntries(
									domainNames.map( ( name ) => [ name, AVAILABILITY[ name ] ?? available() ] )
								);
							},
						} ),
						namePulseSuggestions: ( params ) => ( {
							...contextValue.queries.namePulseSuggestions( params ),
							queryFn: async () => suggestionsResponse,
						} ),
						domainAvailability: ( domainName ) => ( {
							...contextValue.queries.domainAvailability( domainName ),
							queryFn: async () =>
								buildAvailability( {
									domain_name: domainName,
									status: DomainAvailabilityStatus.AVAILABLE,
									cost: '$24.00',
									raw_price: 24,
								} ),
						} ),
					},
				} }
			>
				<NamePulseResults />
			</DomainSearchContext.Provider>
		</QueryClientProvider>
	);
};

const sectionRows = ( id: string ) =>
	within( document.querySelector( `[data-section="${ id }"]` ) as HTMLElement ).getAllByRole(
		'listitem'
	);

const rowFor = ( domainName: string ) =>
	document.querySelector( `[data-domain="${ domainName }"]` ) as HTMLElement;

describe( 'NamePulseResults', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	it( 'renders Top results and the exact-match grid for a single word', async () => {
		render( <NamePulseTestSearch query="icecream" /> );

		expect( screen.getByRole( 'heading', { name: 'Top results' } ) ).toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Exact match for “icecream”' } )
		).toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: 'More suggestions' } ) ).not.toBeInTheDocument();

		expect( await within( rowFor( 'icecream.net' ) ).findByText( '$24' ) ).toBeInTheDocument();
		expect( within( rowFor( 'icecream.net' ) ).getByText( '/year' ) ).toBeInTheDocument();
		expect(
			within( rowFor( 'icecream.net' ) ).getByRole( 'button', { name: 'Add to cart' } )
		).toBeInTheDocument();

		expect( sectionRows( 'top' ) ).toHaveLength( 3 );
		expect( sectionRows( 'exact' ) ).toHaveLength( NAME_PULSE_PAGE_SIZE );
	} );

	it( 'renders premium, sale and unavailable rows', async () => {
		render( <NamePulseTestSearch query="icecream" /> );

		const premium = rowFor( 'icecream.co' );
		expect( await within( premium ).findByText( 'Premium' ) ).toBeInTheDocument();
		expect( within( premium ).queryByText( '/year' ) ).not.toBeInTheDocument();
		expect( within( premium ).getByRole( 'button', { name: 'Add to cart' } ) ).toBeInTheDocument();

		const sale = rowFor( 'icecream.online' );
		expect( await within( sale ).findByText( 'Sale' ) ).toBeInTheDocument();
		expect( within( sale ).getByText( '$6' ) ).toBeInTheDocument();
		expect( within( sale ).getByText( '/first year' ) ).toBeInTheDocument();
		expect( within( sale ).getByText( '$48/year renewal' ) ).toBeInTheDocument();

		const unavailable = rowFor( 'icecream.io' );
		expect( await within( unavailable ).findByText( 'Unavailable' ) ).toBeInTheDocument();
		expect( within( unavailable ).queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	it( 'reveals more exact matches and checks the revealed rows', async () => {
		const availabilityRequests: string[][] = [];
		const user = userEvent.setup();

		render(
			<NamePulseTestSearch query="icecream" availabilityRequests={ availabilityRequests } />
		);

		await within( rowFor( 'icecream.net' ) ).findByText( '$24' );
		const checkedBefore = availabilityRequests.flat();
		expect( checkedBefore ).toHaveLength( NAME_PULSE_INITIAL_CHECK_SINGLE_WORD );

		await user.click( screen.getByRole( 'button', { name: 'Show more exact matches' } ) );
		expect( sectionRows( 'exact' ) ).toHaveLength( NAME_PULSE_PAGE_SIZE * 2 );
		// The first two pages were checked up front; nothing new to request yet.
		expect( availabilityRequests.flat() ).toHaveLength( checkedBefore.length );

		await user.click( screen.getByRole( 'button', { name: 'Show more exact matches' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Show more exact matches' } ) );
		expect( sectionRows( 'exact' ) ).toHaveLength( NAME_PULSE_PAGE_SIZE * 4 );

		const revealed = sectionRows( 'exact' )
			.slice( NAME_PULSE_PAGE_SIZE * 3 )
			.map( ( item ) => item.querySelector( '[data-domain]' )?.getAttribute( 'data-domain' ) );
		const unchecked = revealed.filter( ( name ) => name && ! checkedBefore.includes( name ) );

		expect( unchecked.length ).toBeGreaterThan( 0 );
		expect( availabilityRequests.flat() ).toEqual( expect.arrayContaining( unchecked ) );
		expect(
			await within( rowFor( unchecked[ 0 ] as string ) ).findByText( '$24' )
		).toBeInTheDocument();
	} );

	it( 'renders Related matches for a multi-word query', async () => {
		render( <NamePulseTestSearch query="ice cream" /> );

		expect(
			screen.getByRole( 'heading', { name: 'Exact match for “icecream”' } )
		).toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'Related matches' } ) ).toBeInTheDocument();

		await waitFor( () => expect( rowFor( 'icecream.best' ) ).not.toBeNull() );
		expect( within( rowFor( 'icecream.best' ) ).getByText( 'Sale' ) ).toBeInTheDocument();
		expect( within( rowFor( 'creamyice.com' ) ).getByText( '$24' ) ).toBeInTheDocument();
		expect( sectionRows( 'suggestions' ) ).toHaveLength( 2 );
	} );

	it( 'hides Top results and the exact-match grid for four or more words', async () => {
		render( <NamePulseTestSearch query="a blog about ice cream" /> );

		await waitFor( () => expect( rowFor( 'icecream.best' ) ).not.toBeNull() );
		expect( screen.getByRole( 'heading', { name: 'Related matches' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: 'Top results' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: /Exact match/ } ) ).not.toBeInTheDocument();
	} );

	it( 'adds a row to the cart after the real-time check', async () => {
		const user = userEvent.setup();
		const cart = buildCart();

		render( <NamePulseTestSearch query="icecream" cart={ cart } /> );

		await within( rowFor( 'icecream.net' ) ).findByText( '$24' );
		await user.click(
			within( rowFor( 'icecream.net' ) ).getByRole( 'button', { name: 'Add to cart' } )
		);

		await waitFor( () =>
			expect( cart.onAddItem ).toHaveBeenCalledWith(
				expect.objectContaining( { domain_name: 'icecream.net', cost: '$24.00' } )
			)
		);
	} );
} );
