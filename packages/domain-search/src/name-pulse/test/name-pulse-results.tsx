/**
 * @jest-environment jsdom
 */
import { DomainAvailabilityStatus } from '@automattic/api-core';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NamePulseResults } from '..';
import { DomainSearchContext, useDomainSearchContextValue } from '../../page/context';
import { buildAvailability } from '../../test-helpers/factories/availability';
import { buildCart } from '../../test-helpers/factories/cart';
import {
	buildNamePulseAvailabilityResponse,
	NAME_PULSE_AI_SUGGESTIONS_FIXTURE,
	NAME_PULSE_SUGGESTIONS_FIXTURE,
	NAME_PULSE_TLDS_FIXTURE,
	withNamePulseQueries,
} from '../../test-helpers/factories/name-pulse';
import { queryClient } from '../../test-helpers/renderer';
import {
	NAME_PULSE_AI_TIMEOUT_MS,
	NAME_PULSE_INITIAL_CHECK_SINGLE_WORD,
	NAME_PULSE_PAGE_SIZE,
} from '../helpers';
import type { DomainSearchCart, DomainSearchProps } from '../../page/types';
import type {
	DomainAvailability,
	NamePulseAvailabilityResponse,
	NamePulseSuggestionsQuery,
	NamePulseSuggestionsResponse,
} from '@automattic/api-core';

const NamePulseTestSearch = ( {
	query,
	slots,
	cart = buildCart(),
	availabilityRequests = [],
	availability = async ( domainNames ) => buildNamePulseAvailabilityResponse( domainNames ),
	suggestions = async ( { use_ai } ) => ( {
		suggestions: use_ai ? NAME_PULSE_AI_SUGGESTIONS_FIXTURE : NAME_PULSE_SUGGESTIONS_FIXTURE,
		errors: [],
	} ),
	tldsResponse = async () => NAME_PULSE_TLDS_FIXTURE,
	domainAvailability = async ( domainName ) =>
		buildAvailability( {
			domain_name: domainName,
			status: DomainAvailabilityStatus.AVAILABLE,
			cost: '$24.00',
			raw_price: 24,
		} ),
}: {
	query: string;
	slots?: DomainSearchProps[ 'slots' ];
	cart?: DomainSearchCart;
	availabilityRequests?: string[][];
	availability?: ( domainNames: string[] ) => Promise< NamePulseAvailabilityResponse >;
	suggestions?: ( params: NamePulseSuggestionsQuery ) => Promise< NamePulseSuggestionsResponse >;
	tldsResponse?: () => Promise< string[] >;
	domainAvailability?: ( domainName: string ) => Promise< DomainAvailability >;
} ) => {
	const contextValue = useDomainSearchContextValue( {
		cart,
		query,
		slots,
		config: { showNamePulseSearch: true },
	} );

	return (
		<QueryClientProvider client={ queryClient }>
			<DomainSearchContext.Provider
				value={ withNamePulseQueries( contextValue, {
					availability: async ( domainNames ) => {
						availabilityRequests.push( domainNames );

						return availability( domainNames );
					},
					suggestions,
					tlds: tldsResponse,
					domainAvailability,
				} ) }
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

const findRow = async ( domainName: string ) => {
	await waitFor( () => expect( rowFor( domainName ) ).not.toBeNull() );

	return rowFor( domainName );
};

const skeletonsIn = ( id: string ) =>
	document.querySelectorAll( `[data-section="${ id }"] .name-pulse-row--skeleton` ).length;

const domainsIn = ( id: string ) =>
	sectionRows( id ).map( ( item ) =>
		item.querySelector( '[data-domain]' )?.getAttribute( 'data-domain' )
	);

describe( 'NamePulseResults', () => {
	beforeEach( () => {
		queryClient.clear();
	} );

	it( 'shows skeletons until the TLD list arrives, then Top results and the exact-match grid in its order', async () => {
		const availabilityRequests: string[][] = [];
		let resolveTlds: ( tlds: string[] ) => void = () => {};
		const tldsResponse = () =>
			new Promise< string[] >( ( resolve ) => {
				resolveTlds = resolve;
			} );

		render(
			<NamePulseTestSearch
				query="icecream"
				availabilityRequests={ availabilityRequests }
				tldsResponse={ tldsResponse }
			/>
		);

		expect( screen.getByRole( 'heading', { name: 'Top results' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: /Exact match/ } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: 'Related matches' } ) ).not.toBeInTheDocument();
		expect( skeletonsIn( 'top' ) ).toBe( 3 );
		expect( skeletonsIn( 'exact' ) ).toBe( NAME_PULSE_PAGE_SIZE );
		expect( rowFor( 'icecream.net' ) ).toBeNull();
		expect( availabilityRequests ).toHaveLength( 0 );

		await act( async () => {
			resolveTlds( NAME_PULSE_TLDS_FIXTURE );
		} );

		expect(
			await within( await findRow( 'icecream.net' ) ).findByText( '$24' )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Exact match for “icecream”' } )
		).toBeInTheDocument();
		expect( within( rowFor( 'icecream.net' ) ).getByText( '/year' ) ).toBeInTheDocument();
		expect(
			within( rowFor( 'icecream.net' ) ).getByRole( 'button', { name: 'Add to cart' } )
		).toBeInTheDocument();
		expect( skeletonsIn( 'exact' ) ).toBe( 0 );
		expect( sectionRows( 'exact' ) ).toHaveLength( NAME_PULSE_PAGE_SIZE );
		expect( availabilityRequests.flat() ).toHaveLength( NAME_PULSE_INITIAL_CHECK_SINGLE_WORD );
		expect( domainsIn( 'top' ) ).toEqual( [ 'icecream.blog', 'icecream.com', 'icecream.app' ] );
		expect( domainsIn( 'exact' ).slice( 0, 4 ) ).toEqual( [
			'icecream.org',
			'icecream.net',
			'icecream.art',
			'icecream.info',
		] );
	} );

	it( 'shows a notice with retry when the TLD list fails to load', async () => {
		const user = userEvent.setup();
		const availabilityRequests: string[][] = [];
		const tldsResponse = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'tlds failed' ) )
			.mockResolvedValue( NAME_PULSE_TLDS_FIXTURE );

		render(
			<NamePulseTestSearch
				query="ice cream"
				availabilityRequests={ availabilityRequests }
				tldsResponse={ tldsResponse }
			/>
		);

		expect( await screen.findByText( 'Couldn’t load domain endings.' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: 'Top results' } ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'Related matches' } ) ).toBeInTheDocument();
		expect( availabilityRequests ).toHaveLength( 0 );

		await user.click( screen.getByRole( 'button', { name: 'Try again' } ) );

		expect(
			await within( await findRow( 'icecream.net' ) ).findByText( '$24' )
		).toBeInTheDocument();
		expect( screen.queryByText( 'Couldn’t load domain endings.' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'Top results' } ) ).toBeInTheDocument();
		expect( tldsResponse ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'renders premium, sale, unavailable and unknown rows', async () => {
		render(
			<NamePulseTestSearch
				query="icecream"
				availability={ async ( domainNames ) =>
					buildNamePulseAvailabilityResponse(
						domainNames.filter( ( name ) => name !== 'icecream.club' )
					)
				}
			/>
		);

		const premium = await findRow( 'icecream.co' );
		expect( await within( premium ).findByText( 'Premium' ) ).toBeInTheDocument();
		expect( within( premium ).queryByText( '/year' ) ).not.toBeInTheDocument();
		expect( within( premium ).getByRole( 'button', { name: 'Add to cart' } ) ).toBeInTheDocument();

		const sale = await findRow( 'icecream.site' );
		expect( await within( sale ).findByText( 'Sale' ) ).toBeInTheDocument();
		expect( within( sale ).getByText( '$6' ) ).toBeInTheDocument();
		expect( within( sale ).getByText( '/first year' ) ).toBeInTheDocument();
		expect( within( sale ).getByText( '$48/year renewal' ) ).toBeInTheDocument();

		const unavailable = await findRow( 'icecream.online' );
		expect( await within( unavailable ).findByText( 'Unavailable' ) ).toBeInTheDocument();
		expect( within( unavailable ).queryByRole( 'button' ) ).not.toBeInTheDocument();

		const unknown = await findRow( 'icecream.club' );
		expect( await within( unknown ).findByText( 'Couldn’t check' ) ).toBeInTheDocument();
		expect( within( unknown ).queryByRole( 'button' ) ).not.toBeInTheDocument();
	} );

	it( 'reveals more exact matches and checks the revealed rows', async () => {
		const availabilityRequests: string[][] = [];
		const user = userEvent.setup();

		render(
			<NamePulseTestSearch query="icecream" availabilityRequests={ availabilityRequests } />
		);

		await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
		const checkedBefore = availabilityRequests.flat();
		expect( checkedBefore ).toHaveLength( NAME_PULSE_INITIAL_CHECK_SINGLE_WORD );

		await user.click( screen.getByRole( 'button', { name: 'Show more exact matches' } ) );
		expect( sectionRows( 'exact' ) ).toHaveLength( NAME_PULSE_PAGE_SIZE * 2 );
		// The first two pages were checked up front; nothing new to request yet.
		expect( availabilityRequests.flat() ).toHaveLength( checkedBefore.length );

		await user.click( screen.getByRole( 'button', { name: 'Show more exact matches' } ) );
		expect( sectionRows( 'exact' ) ).toHaveLength( NAME_PULSE_PAGE_SIZE * 3 );

		const revealed = domainsIn( 'exact' ).slice( NAME_PULSE_PAGE_SIZE * 2 );
		const unchecked = revealed.filter( ( name ) => name && ! checkedBefore.includes( name ) );

		expect( unchecked.length ).toBeGreaterThan( 0 );
		expect( availabilityRequests.flat() ).toEqual( expect.arrayContaining( unchecked ) );
		expect(
			await within( rowFor( unchecked[ 0 ] as string ) ).findByText( '$24' )
		).toBeInTheDocument();
	} );

	it( 'renders Related matches for a multi-word query', async () => {
		render( <NamePulseTestSearch query="ice cream" /> );

		expect( screen.getByRole( 'heading', { name: 'Related matches' } ) ).toBeInTheDocument();
		expect(
			await screen.findByRole( 'heading', { name: 'Exact match for “icecream”' } )
		).toBeInTheDocument();

		await waitFor( () => expect( rowFor( 'icecream.best' ) ).not.toBeNull() );
		expect( within( rowFor( 'icecream.best' ) ).getByText( 'Sale' ) ).toBeInTheDocument();
		expect( within( rowFor( 'creamyice.com' ) ).getByText( '$24' ) ).toBeInTheDocument();
		expect( sectionRows( 'suggestions' ) ).toHaveLength( NAME_PULSE_SUGGESTIONS_FIXTURE.length );
	} );

	it( 'drops the exact-match grid and adds Creative matches for a four-word query', async () => {
		const requested: NamePulseSuggestionsQuery[] = [];

		render(
			<NamePulseTestSearch
				query="a blog about icecream"
				suggestions={ async ( params ) => {
					requested.push( params );

					return {
						suggestions: params.use_ai
							? NAME_PULSE_AI_SUGGESTIONS_FIXTURE
							: NAME_PULSE_SUGGESTIONS_FIXTURE,
						errors: [],
					};
				} }
			/>
		);

		expect( screen.getByRole( 'heading', { name: 'Top results' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'heading', { name: /Exact match/ } ) ).not.toBeInTheDocument();
		expect( skeletonsIn( 'top' ) ).toBe( 3 );

		expect(
			await screen.findByRole( 'heading', { name: 'Creative matches' } )
		).toBeInTheDocument();
		expect( screen.getByRole( 'heading', { name: 'Related matches' } ) ).toBeInTheDocument();
		expect( skeletonsIn( 'top' ) ).toBe( 0 );

		expect( requested ).toEqual( [
			{ query: 'a blog about icecream', use_ai: false },
			{ query: 'a blog about icecream', use_ai: true, timeout: NAME_PULSE_AI_TIMEOUT_MS },
		] );

		// Cheapest available across both lists, ties broken by name.
		expect( domainsIn( 'top' ) ).toEqual( [
			'brainfreeze.club',
			'scoops.blog',
			'thedailyscoop.blog',
		] );
		// Featured rows, and the copy the keyword list already showed, are not repeated.
		expect( domainsIn( 'suggestions' ) ).not.toContain( 'scoops.blog' );
		expect( domainsIn( 'creative' ) ).toEqual( [ 'coldcomfort.cafe' ] );
	} );

	it( 'keeps Top results loading until both suggestion lists settle', async () => {
		let resolveAi: ( response: NamePulseSuggestionsResponse ) => void = () => {};

		render(
			<NamePulseTestSearch
				query="a blog about icecream"
				suggestions={ async ( { use_ai } ) => {
					if ( ! use_ai ) {
						return { suggestions: NAME_PULSE_SUGGESTIONS_FIXTURE, errors: [] };
					}

					return new Promise< NamePulseSuggestionsResponse >( ( resolve ) => {
						resolveAi = resolve;
					} );
				} }
			/>
		);

		expect( await screen.findByRole( 'heading', { name: 'Related matches' } ) ).toBeInTheDocument();
		expect( skeletonsIn( 'top' ) ).toBe( 3 );

		await act( async () => {
			resolveAi( { suggestions: NAME_PULSE_AI_SUGGESTIONS_FIXTURE, errors: [] } );
		} );

		await waitFor( () => expect( skeletonsIn( 'top' ) ).toBe( 0 ) );
		expect( domainsIn( 'top' ) ).toEqual( [
			'brainfreeze.club',
			'scoops.blog',
			'thedailyscoop.blog',
		] );
	} );

	it( 'renders a typed FQDN as a row of the exact-match grid', async () => {
		render( <NamePulseTestSearch query="icecream.net" /> );

		expect(
			await within( await findRow( 'icecream.net' ) ).findByText( '$24' )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Exact match for “icecream”' } )
		).toBeInTheDocument();
		expect( domainsIn( 'exact' ) ).toContain( 'icecream.net' );
		expect( screen.queryByRole( 'heading', { name: 'Related matches' } ) ).not.toBeInTheDocument();
	} );

	it( 'renders the BeforeResults slot between the search input and the results', () => {
		render(
			<NamePulseTestSearch
				query="icecream"
				slots={ { BeforeResults: () => <div>Before Results</div> } }
			/>
		);

		const banner = screen.getByText( 'Before Results' );
		const searchInput = document.querySelector( '.domain-search__search-bar' ) as HTMLElement;
		const firstSection = screen.getByRole( 'heading', { name: 'Top results' } );

		expect(
			searchInput.compareDocumentPosition( banner ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
		expect(
			banner.compareDocumentPosition( firstSection ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	it( 'is not rendered when no BeforeResults slot is passed', () => {
		render( <NamePulseTestSearch query="icecream" /> );

		expect( screen.queryByText( 'Before Results' ) ).not.toBeInTheDocument();
	} );

	it( 'runs the real-time check on add to cart: a taken verdict flips the row, an available one adds it', async () => {
		const user = userEvent.setup();
		const cart = buildCart();

		render(
			<NamePulseTestSearch
				query="ice cream"
				cart={ cart }
				domainAvailability={ async ( domainName ) =>
					buildAvailability( {
						domain_name: domainName,
						status:
							domainName === 'creamyice.com'
								? DomainAvailabilityStatus.NOT_AVAILABLE
								: DomainAvailabilityStatus.AVAILABLE,
						cost: '$24.00',
						raw_price: 24,
					} )
				}
			/>
		);

		const suggestion = await findRow( 'creamyice.com' );
		expect( within( suggestion ).getByText( '$24' ) ).toBeInTheDocument();

		await user.click( within( suggestion ).getByRole( 'button', { name: 'Add to cart' } ) );

		expect(
			await within( rowFor( 'creamyice.com' ) ).findByText( 'Unavailable' )
		).toBeInTheDocument();
		expect(
			within( rowFor( 'creamyice.com' ) ).getByRole( 'button', {
				name: 'Sorry, this domain is no longer available.',
			} )
		).toHaveAttribute( 'aria-disabled', 'true' );
		expect(
			within( rowFor( 'creamyice.com' ) ).queryByRole( 'button', { name: 'Add to cart' } )
		).not.toBeInTheDocument();
		expect( within( rowFor( 'creamyice.com' ) ).queryByText( '$24' ) ).not.toBeInTheDocument();
		expect( cart.onAddItem ).not.toHaveBeenCalled();

		await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
		await user.click(
			within( rowFor( 'icecream.net' ) ).getByRole( 'button', { name: 'Add to cart' } )
		);

		await waitFor( () =>
			expect( cart.onAddItem ).toHaveBeenCalledWith(
				expect.objectContaining( { domain_name: 'icecream.net', cost: '$24.00' } )
			)
		);
		expect( cart.onAddItem ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'keeps a top result in its slot when the real-time check finds it taken', async () => {
		const user = userEvent.setup();
		const cart = buildCart();

		render(
			<NamePulseTestSearch
				query="icecream"
				cart={ cart }
				domainAvailability={ async ( domainName ) =>
					buildAvailability( {
						domain_name: domainName,
						status:
							domainName === 'icecream.blog'
								? DomainAvailabilityStatus.NOT_AVAILABLE
								: DomainAvailabilityStatus.AVAILABLE,
						cost: '$24.00',
						raw_price: 24,
					} )
				}
			/>
		);

		const topDomains = [ 'icecream.blog', 'icecream.com', 'icecream.app' ];
		await waitFor( () => expect( domainsIn( 'top' ) ).toEqual( topDomains ) );

		// Cards render as soon as the name is known; the button waits for the verdict.
		await user.click(
			await within( rowFor( 'icecream.blog' ) ).findByRole( 'button', { name: 'Add to cart' } )
		);

		const errorCTA = await within( rowFor( 'icecream.blog' ) ).findByRole( 'button', {
			name: 'Sorry, this domain is no longer available.',
		} );
		expect( errorCTA ).toHaveAttribute( 'aria-disabled', 'true' );
		expect( within( rowFor( 'icecream.blog' ) ).getByText( 'Unavailable' ) ).toBeInTheDocument();
		expect( domainsIn( 'top' ) ).toEqual( topDomains );

		await user.click( errorCTA );

		expect( cart.onAddItem ).not.toHaveBeenCalled();
	} );
} );
