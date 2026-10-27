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
	buildNamePulseBundle,
	NAME_PULSE_AI_SUGGESTIONS_FIXTURE,
	NAME_PULSE_AVAILABILITY_FIXTURE,
	NAME_PULSE_SUGGESTIONS_FIXTURE,
	NAME_PULSE_TLDS_FIXTURE,
	withNamePulseQueries,
} from '../../test-helpers/factories/name-pulse';
import { queryClient } from '../../test-helpers/renderer';
import { NAME_PULSE_INITIAL_CHECK_SINGLE_WORD, NAME_PULSE_PAGE_SIZE } from '../helpers';
import type { DomainSearchCart, DomainSearchEvents, DomainSearchProps } from '../../page/types';
import type {
	BundleSuggestion,
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
	domainAvailability = async ( domainName ) => {
		// Only this check knows a premium name's registry price; the bulk one
		// quotes the standard TLD rate.
		const isPremium = !! NAME_PULSE_AVAILABILITY_FIXTURE[ domainName ]?.is_premium;

		return buildAvailability( {
			domain_name: domainName,
			status: isPremium
				? DomainAvailabilityStatus.AVAILABLE_PREMIUM
				: DomainAvailabilityStatus.AVAILABLE,
			...( isPremium ? { is_supported_premium_domain: true } : {} ),
			cost: isPremium ? '$3,500.00' : '$24.00',
			raw_price: isPremium ? 3500 : 24,
		} );
	},
	events,
	showBundleSuggestions = false,
	bundleForDomain = async ( fqdn ) => buildNamePulseBundle( fqdn ),
}: {
	query: string;
	slots?: DomainSearchProps[ 'slots' ];
	cart?: DomainSearchCart;
	availabilityRequests?: string[][];
	availability?: ( domainNames: string[] ) => Promise< NamePulseAvailabilityResponse >;
	suggestions?: ( params: NamePulseSuggestionsQuery ) => Promise< NamePulseSuggestionsResponse >;
	tldsResponse?: () => Promise< string[] >;
	domainAvailability?: ( domainName: string ) => Promise< DomainAvailability >;
	events?: Partial< DomainSearchEvents >;
	showBundleSuggestions?: boolean;
	bundleForDomain?: ( fqdn: string ) => Promise< BundleSuggestion | null >;
} ) => {
	const contextValue = useDomainSearchContextValue( {
		cart,
		query,
		events,
		slots,
		config: { showNamePulseSearch: true, allowsUsingOwnDomain: true, showBundleSuggestions },
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
					bundleForDomain,
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

const findElement = ( selector: string ) =>
	waitFor( () => {
		const element = document.querySelector< HTMLElement >( selector );
		expect( element ).not.toBeNull();

		return element as HTMLElement;
	} );

const findNotice = () => findElement( '.name-pulse-notice' );

const findExactMatchCard = () => findElement( '.name-pulse-exact-card[data-domain]' );

const findBundleCard = () =>
	findElement( '.name-pulse-bundle-card:not(.name-pulse-bundle-card--placeholder)' );

const isAfterTopResults = ( element: HTMLElement ) =>
	Boolean(
		( document.querySelector( '[data-section="top"]' ) as HTMLElement ).compareDocumentPosition(
			element
		) & Node.DOCUMENT_POSITION_FOLLOWING
	);

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
		expect( domainsIn( 'top' ) ).toEqual( [ 'icecream.blog', 'icecream.com', 'icecream.org' ] );
		expect( domainsIn( 'exact' ).slice( 0, 4 ) ).toEqual( [
			'icecream.net',
			'icecream.art',
			'icecream.info',
			'icecream.shop',
		] );
	} );

	it( 'moves the ending a bare word ends in to the second slot', async () => {
		render( <NamePulseTestSearch query="myapp" /> );

		await findRow( 'my.app' );

		await waitFor( () =>
			expect( domainsIn( 'top' ) ).toEqual( [ 'myapp.blog', 'my.app', 'myapp.com' ] )
		);
	} );

	it( 'keeps the list order for a typed domain whose name ends in an ending', async () => {
		render( <NamePulseTestSearch query="myapp.com" /> );

		await findRow( 'my.app' );

		await waitFor( () =>
			expect( domainsIn( 'top' ) ).toEqual( [ 'myapp.blog', 'myapp.org', 'myapp.net' ] )
		);
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
		expect( await within( premium ).findByText( '$3,500' ) ).toBeInTheDocument();
		expect( within( premium ).getByText( 'Premium' ) ).toBeInTheDocument();
		expect( within( premium ).getByText( '/year' ) ).toBeInTheDocument();
		expect( within( premium ).getByRole( 'button', { name: 'Add to cart' } ) ).toBeInTheDocument();

		const sale = await findRow( 'icecream.site' );
		expect( await within( sale ).findByText( '$6' ) ).toBeInTheDocument();
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

	it( 'renders Related matches for a one-word query', async () => {
		render( <NamePulseTestSearch query="icecream" /> );

		expect( screen.getByRole( 'heading', { name: 'Related matches' } ) ).toBeInTheDocument();

		await waitFor( () => expect( rowFor( 'creamyice.com' ) ).not.toBeNull() );
		expect( sectionRows( 'suggestions' ) ).toHaveLength( NAME_PULSE_SUGGESTIONS_FIXTURE.length );
	} );

	it( 'renders Related matches for a multi-word query', async () => {
		render( <NamePulseTestSearch query="ice cream" /> );

		expect( screen.getByRole( 'heading', { name: 'Related matches' } ) ).toBeInTheDocument();
		expect(
			await screen.findByRole( 'heading', { name: 'Exact match for “icecream”' } )
		).toBeInTheDocument();

		await waitFor( () => expect( rowFor( 'icecream.best' ) ).not.toBeNull() );
		expect( within( rowFor( 'icecream.best' ) ).getByText( '/first year' ) ).toBeInTheDocument();
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
			{ query: 'a blog about icecream', use_ai: true },
		] );

		// Cheapest first-year price across both lists, ties broken by name.
		expect( domainsIn( 'top' ) ).toEqual( [ 'icecream.best', 'brainfreeze.club', 'scoops.blog' ] );
		// Featured rows, and the copy the keyword list already showed, are not repeated.
		expect( domainsIn( 'suggestions' ) ).not.toContain( 'scoops.blog' );
		expect( domainsIn( 'creative' ) ).toEqual( [ 'thedailyscoop.blog', 'coldcomfort.cafe' ] );
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
		expect( domainsIn( 'top' ) ).toEqual( [ 'icecream.best', 'brainfreeze.club', 'scoops.blog' ] );
	} );

	it( 'features an available typed FQDN in its own card, out of Top results and the grid', async () => {
		render( <NamePulseTestSearch query="icecream.net" /> );

		const card = within( await findExactMatchCard() );
		expect( card.getByText( 'Exact match' ) ).toBeVisible();
		expect( card.getByText( "It's available!" ) ).toBeVisible();
		expect( card.getByText( '$24.00' ) ).toBeVisible();
		expect( card.getByRole( 'button', { name: 'Add to cart' } ) ).toBeEnabled();
		expect( screen.getByText( 'icecream.net is available.' ) ).toBeInTheDocument();
		expect( document.querySelector( '.name-pulse-featured' ) ).toHaveAttribute(
			'aria-busy',
			'false'
		);

		expect(
			await screen.findByRole( 'heading', { name: 'Exact match for “icecream”' } )
		).toBeInTheDocument();
		await waitFor( () => expect( domainsIn( 'top' ) ).toHaveLength( 3 ) );
		expect( domainsIn( 'top' ) ).not.toContain( 'icecream.net' );
		expect( domainsIn( 'exact' ) ).not.toContain( 'icecream.net' );
		expect( screen.getByRole( 'heading', { name: 'Related matches' } ) ).toBeInTheDocument();
	} );

	it( 'explains an unrecognised ending and lists the joined name', async () => {
		render( <NamePulseTestSearch query="icecream.d" /> );

		expect( await findNotice() ).toHaveTextContent(
			'We don’t recognize that ending. Try .com or .blog, or enter just the name and we’ll suggest the rest.'
		);
		expect(
			await within( await findRow( 'icecreamd.net' ) ).findByText( '$24' )
		).toBeInTheDocument();
		expect(
			screen.getByRole( 'heading', { name: 'Exact match for “icecreamd”' } )
		).toBeInTheDocument();
	} );

	it( 'lets the reader dismiss the notice about how their query was read', async () => {
		const user = userEvent.setup();

		render( <NamePulseTestSearch query="icecream.d" /> );

		await findNotice();
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

		expect( document.querySelector( '.name-pulse-notice' ) ).toBeNull();
		expect( await findRow( 'icecreamd.net' ) ).toBeInTheDocument();
	} );

	it( 'places the notice above the BeforeResults slot', async () => {
		render(
			<NamePulseTestSearch
				query="icecream.d"
				slots={ { BeforeResults: () => <div>Before Results</div> } }
			/>
		);

		const notice = await findNotice();
		const banner = screen.getByText( 'Before Results' );

		expect(
			notice.compareDocumentPosition( banner ) & Node.DOCUMENT_POSITION_FOLLOWING
		).toBeTruthy();
	} );

	it( 'brings back a dismissed notice when the query changes', async () => {
		const user = userEvent.setup();

		const { rerender } = render( <NamePulseTestSearch query="icecream.d" /> );

		await findNotice();
		await user.click( screen.getByRole( 'button', { name: 'Close' } ) );
		expect( document.querySelector( '.name-pulse-notice' ) ).toBeNull();

		rerender( <NamePulseTestSearch query="sorbet.d" /> );

		expect( await findNotice() ).toHaveTextContent(
			'We don’t recognize that ending. Try .com or .blog, or enter just the name and we’ll suggest the rest.'
		);
	} );

	it( 'offers a transfer for a typed domain registered elsewhere, keeping its row in the grid', async () => {
		const user = userEvent.setup();
		const onExternalDomainClick = jest.fn();

		render(
			<NamePulseTestSearch
				query="icecream.net"
				events={ { onExternalDomainClick } }
				domainAvailability={ async ( domainName ) =>
					buildAvailability( {
						domain_name: domainName,
						status: DomainAvailabilityStatus.TRANSFERRABLE,
						tld: 'net',
					} )
				}
			/>
		);

		expect( await findNotice() ).toHaveTextContent( 'This domain is already registered.' );

		// The bulk check offers the name; only the per-domain check behind the notice
		// knows it is registered, and the row must not contradict it.
		const row = within( await findRow( 'icecream.net' ) );
		expect( await row.findByText( 'Unavailable' ) ).toBeVisible();
		expect( row.queryByRole( 'button', { name: 'Add to cart' } ) ).not.toBeInTheDocument();

		expect( await findNotice() ).toHaveTextContent( 'Already yours?' );
		await user.click( screen.getByRole( 'button', { name: 'Transfer it here.' } ) );

		expect( onExternalDomainClick ).toHaveBeenCalledWith( 'icecream.net' );
	} );

	it( 'keeps a typed domain that is taken out of Top results, leaving it in the grid', async () => {
		render(
			<NamePulseTestSearch
				query="icecream.com"
				availability={ async ( domainNames ) => ( {
					...buildNamePulseAvailabilityResponse( domainNames ),
					...( domainNames.includes( 'icecream.com' )
						? { 'icecream.com': { is_available: false } }
						: {} ),
				} ) }
				domainAvailability={ async ( domainName ) =>
					buildAvailability( {
						domain_name: domainName,
						status: DomainAvailabilityStatus.TRANSFERRABLE,
					} )
				}
			/>
		);

		expect( await findNotice() ).toHaveTextContent( 'This domain is already registered.' );
		expect( within( await findRow( 'icecream.com' ) ).getByText( 'Unavailable' ) ).toBeVisible();
		expect( domainsIn( 'top' ) ).toEqual( [ 'icecream.blog', 'icecream.org', 'icecream.net' ] );
		expect( domainsIn( 'exact' ) ).toContain( 'icecream.com' );
	} );

	it( 'holds the typed domain on its check rather than offering a name the notice is about to reject', async () => {
		let resolveTyped: ( availability: DomainAvailability ) => void = () => {};

		render(
			<NamePulseTestSearch
				query="icecream.net"
				domainAvailability={ ( domainName ) => {
					if ( domainName === 'icecream.net' ) {
						return new Promise< DomainAvailability >( ( resolve ) => {
							resolveTyped = resolve;
						} );
					}

					return Promise.resolve(
						buildAvailability( {
							domain_name: domainName,
							status: DomainAvailabilityStatus.AVAILABLE,
							cost: '$24.00',
							raw_price: 24,
						} )
					);
				} }
			/>
		);

		// The bulk check offers the typed name, but its own check is still running:
		// it waits in the card's slot rather than as a priced row.
		const placeholder = await screen.findByRole( 'status', {
			name: 'Loading exact match',
		} );
		expect( placeholder.closest( '.name-pulse-featured' ) ).toHaveAttribute( 'aria-busy', 'true' );
		await findRow( 'icecream.org' );
		expect( rowFor( 'icecream.net' ) ).toBeNull();

		await act( async () => {
			resolveTyped(
				buildAvailability( {
					domain_name: 'icecream.net',
					status: DomainAvailabilityStatus.TRANSFERRABLE,
					tld: 'net',
				} )
			);
		} );

		expect( await findNotice() ).toHaveTextContent( 'This domain is already registered.' );
		expect( document.querySelector( '.name-pulse-exact-card' ) ).toBeNull();
		expect( within( await findRow( 'icecream.net' ) ).getByText( 'Unavailable' ) ).toBeVisible();
	} );

	it( 'reports a domain already connected to WordPress.com without offering a transfer', async () => {
		render(
			<NamePulseTestSearch
				query="icecream.net"
				domainAvailability={ async ( domainName ) =>
					buildAvailability( { domain_name: domainName, status: DomainAvailabilityStatus.MAPPED } )
				}
			/>
		);

		expect( await findNotice() ).toHaveTextContent(
			'This domain is already connected to a WordPress.com site.'
		);
		expect( screen.queryByRole( 'button', { name: 'Transfer it here.' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Close' } ) ).not.toBeInTheDocument();
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

		const topDomains = [ 'icecream.blog', 'icecream.com', 'icecream.org' ];
		await waitFor( () => expect( domainsIn( 'top' ) ).toEqual( topDomains ) );

		// The row takes its slot as soon as the TLD order is known, a tick before its verdict
		// arrives, so wait for the CTA rather than the row.
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

	it( 'narrows every section to the chosen endings and restores them on clear', async () => {
		const user = userEvent.setup();
		const keywordRequests: NamePulseSuggestionsQuery[] = [];

		render(
			<NamePulseTestSearch
				query="ice cream"
				suggestions={ async ( params ) => {
					keywordRequests.push( params );

					// Like the endpoint, a filtered request returns extra matching names.
					return {
						suggestions: params.tlds
							? [
									...NAME_PULSE_SUGGESTIONS_FIXTURE.filter( ( { domain_name } ) =>
										params.tlds?.some( ( tld ) => domain_name.endsWith( `.${ tld }` ) )
									),
									{ domain_name: 'scoopsandcones.com', relevance: 0.1, raw_price: 24 },
								]
							: NAME_PULSE_SUGGESTIONS_FIXTURE,
						errors: [],
					};
				} }
			/>
		);

		await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
		await findRow( 'creamyice.com' );

		await user.click( screen.getByRole( 'button', { name: 'Filter, no filters applied' } ) );
		await user.click( await screen.findByRole( 'option', { name: '.com' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		// One ending reads like typing that domain, so it gets the Exact match card.
		await waitFor( () =>
			expect( rowFor( 'icecream.com' ) ).toHaveClass( 'name-pulse-exact-card' )
		);
		expect( document.querySelector( '[data-section="top"]' ) ).toBeNull();
		expect( document.querySelector( '[data-section="exact"]' ) ).toBeNull();
		await waitFor( () =>
			expect( domainsIn( 'suggestions' ) ).toEqual( [
				'creamyice.com',
				'icecreamshop.com',
				'frozentreats.com',
				'scoopsandcones.com',
			] )
		);
		expect( keywordRequests.map( ( params ) => params.tlds ) ).toEqual( [ undefined, [ 'com' ] ] );

		await user.click( screen.getByRole( 'button', { name: 'Filter, 1 filter applied' } ) );
		await user.click( await screen.findByRole( 'button', { name: 'Clear' } ) );

		await waitFor( () =>
			expect( domainsIn( 'top' ) ).toEqual( [ 'icecream.blog', 'icecream.com', 'icecream.org' ] )
		);
		expect( sectionRows( 'exact' ) ).toHaveLength( NAME_PULSE_PAGE_SIZE );
		expect( sectionRows( 'suggestions' ) ).toHaveLength( NAME_PULSE_SUGGESTIONS_FIXTURE.length );
		expect(
			screen.getByRole( 'button', { name: 'Filter, no filters applied' } )
		).toBeInTheDocument();
	} );

	it( 'keeps the ending of a typed domain when the filter leaves it out', async () => {
		const user = userEvent.setup();

		render( <NamePulseTestSearch query="icecream.net" /> );

		expect( await within( await findExactMatchCard() ).findByText( '$24.00' ) ).toBeVisible();

		await user.click( screen.getByRole( 'button', { name: 'Filter, no filters applied' } ) );
		await user.click( await screen.findByRole( 'option', { name: '.com' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		// The typed domain keeps its own card; the lists below narrow to the filter.
		await waitFor( () => expect( domainsIn( 'top' ) ).toEqual( [ 'icecream.com' ] ) );
		expect( ( await findExactMatchCard() ).getAttribute( 'data-domain' ) ).toBe( 'icecream.net' );
		expect( document.querySelector( '[data-section="exact"]' ) ).toBeNull();
	} );

	it( 'spans the row with the exact-match card of the one filtered ending when there is no bundle', async () => {
		const user = userEvent.setup();

		render( <NamePulseTestSearch query="icecream" /> );

		await findRow( 'icecream.com' );
		await user.click( screen.getByRole( 'button', { name: 'Filter, no filters applied' } ) );
		await user.click( await screen.findByRole( 'option', { name: '.com' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		const card = await findExactMatchCard();
		expect( card ).toHaveAttribute( 'data-domain', 'icecream.com' );
		expect( await within( card ).findByText( '$24.00' ) ).toBeVisible();
		expect( card ).toHaveClass( 'name-pulse-exact-card--wide' );
	} );

	it( 'keeps a taken name with the one filtered ending in the grid, without a notice', async () => {
		const user = userEvent.setup();

		render(
			<NamePulseTestSearch
				query="icecream"
				domainAvailability={ async ( domainName ) =>
					buildAvailability( {
						domain_name: domainName,
						status: DomainAvailabilityStatus.TRANSFERRABLE,
					} )
				}
			/>
		);

		await findRow( 'icecream.com' );
		await user.click( screen.getByRole( 'button', { name: 'Filter, no filters applied' } ) );
		await user.click( await screen.findByRole( 'option', { name: '.com' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		await waitFor( () => expect( document.querySelector( '.name-pulse-featured' ) ).toBeNull() );
		expect( await findRow( 'icecream.com' ) ).not.toHaveClass( 'name-pulse-exact-card' );
		expect( screen.queryByText( 'This domain is already registered.' ) ).not.toBeInTheDocument();
	} );

	it( 'filters Creative matches on the page, as their provider ignores the chosen endings', async () => {
		const user = userEvent.setup();
		const aiRequests: NamePulseSuggestionsQuery[] = [];

		render(
			<NamePulseTestSearch
				query="a blog about icecream"
				suggestions={ async ( params ) => {
					if ( params.use_ai ) {
						aiRequests.push( params );
					}

					return {
						suggestions: params.use_ai
							? NAME_PULSE_AI_SUGGESTIONS_FIXTURE
							: NAME_PULSE_SUGGESTIONS_FIXTURE,
						errors: [],
					};
				} }
			/>
		);

		await findRow( 'coldcomfort.cafe' );

		await user.click( screen.getByRole( 'button', { name: 'Filter, no filters applied' } ) );
		await user.click( await screen.findByRole( 'option', { name: '.blog' } ) );
		await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

		await waitFor( () => expect( rowFor( 'coldcomfort.cafe' ) ).toBeNull() );
		expect( rowFor( 'brainfreeze.club' ) ).toBeNull();
		expect( rowFor( 'thedailyscoop.blog' ) ).not.toBeNull();
		expect( aiRequests ).toHaveLength( 1 );
		expect( aiRequests[ 0 ].tlds ).toBeUndefined();
	} );

	it( 'shows the sale price and the match reasons of the real-time check on the exact-match card', async () => {
		render(
			<NamePulseTestSearch
				query="icecream.blog"
				domainAvailability={ async ( domainName ) =>
					buildAvailability( {
						domain_name: domainName,
						tld: 'blog',
						cost: '$33',
						renew_cost: '$33',
						sale_cost: 3.3,
						currency_code: 'USD',
						match_reasons: [ 'exact-match', 'tld-common', 'tld-exact' ],
					} )
				}
			/>
		);

		const card = within( await findExactMatchCard() );

		expect( card.getByLabelText( 'Original price: $33' ) ).toBeVisible();
		expect( card.getByLabelText( 'Sale price: $3.30' ) ).toBeVisible();
		expect( card.getByText( /For first year\./ ) ).toBeVisible();
		expect( card.getByText( 'Extension ".blog" matches your query' ) ).toBeVisible();
		expect( card.queryByText( '".blog" is a common extension' ) ).not.toBeInTheDocument();
		// The badge already says it, so the reason list does not repeat it.
		expect( card.getAllByText( 'Exact match' ) ).toHaveLength( 1 );
	} );

	it( 'adds the exact-match card to the cart through the real-time check, then offers to continue', async () => {
		const user = userEvent.setup();
		const onContinue = jest.fn();
		const items: string[] = [];
		const cart = buildCart( {
			onAddItem: jest.fn( async ( suggestion ) => {
				items.push( suggestion.domain_name );
			} ),
			hasItem: ( domainName ) => items.includes( domainName ),
		} );

		const { rerender } = render(
			<NamePulseTestSearch query="icecream.net" cart={ cart } events={ { onContinue } } />
		);

		const card = within( await findExactMatchCard() );
		await user.click( card.getByRole( 'button', { name: 'Add to cart' } ) );

		await waitFor( () =>
			expect( cart.onAddItem ).toHaveBeenCalledWith(
				expect.objectContaining( { domain_name: 'icecream.net', cost: '$24.00' } )
			)
		);

		rerender(
			<NamePulseTestSearch query="icecream.net" cart={ { ...cart } } events={ { onContinue } } />
		);
		await user.click( await card.findByRole( 'button', { name: 'Continue' } ) );

		expect( onContinue ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'confirms the special requirements of the exact-match card before adding it to the cart', async () => {
		const user = userEvent.setup();
		const message = '.blog domains may require identity verification by the registry.';
		const cart = buildCart();

		render(
			<NamePulseTestSearch
				query="icecream.blog"
				cart={ cart }
				domainAvailability={ async ( domainName ) =>
					buildAvailability( {
						domain_name: domainName,
						tld: 'blog',
						policy_notices: [
							{ type: 'identity_verification', label: 'Special requirements', message },
						],
					} )
				}
			/>
		);

		const card = within( await findExactMatchCard() );
		await user.click( card.getByRole( 'button', { name: 'Add to cart' } ) );

		const dialog = await screen.findByRole( 'dialog', { name: 'Special requirements' } );
		expect( dialog ).toHaveTextContent( message );
		expect( cart.onAddItem ).not.toHaveBeenCalled();

		await user.click( within( dialog ).getByRole( 'button', { name: 'Add to cart' } ) );

		await waitFor( () =>
			expect( cart.onAddItem ).toHaveBeenCalledWith(
				expect.objectContaining( { domain_name: 'icecream.blog' } )
			)
		);
		await waitFor( () => expect( screen.queryByRole( 'dialog' ) ).not.toBeInTheDocument() );
	} );

	describe( 'bundle card', () => {
		it( 'is not requested when bundle suggestions are off', async () => {
			const bundleForDomain = jest.fn( async () => null );

			render( <NamePulseTestSearch query="icecream.com" bundleForDomain={ bundleForDomain } /> );

			await findExactMatchCard();
			await waitFor( () => expect( domainsIn( 'top' ) ).toHaveLength( 3 ) );

			expect( bundleForDomain ).not.toHaveBeenCalled();
			expect( document.querySelector( '.name-pulse-bundle-card' ) ).toBeNull();
		} );

		it( 'sits beside the exact-match card of a typed .com, anchored on it', async () => {
			const onBundleShown = jest.fn();
			const bundleForDomain = jest.fn( async ( fqdn: string ) => buildNamePulseBundle( fqdn ) );

			render(
				<NamePulseTestSearch
					query="icecream.com"
					showBundleSuggestions
					bundleForDomain={ bundleForDomain }
					events={ { onBundleShown } }
				/>
			);

			const bundle = await findBundleCard();

			expect( bundle.closest( '.name-pulse-featured' ) ).toContainElement(
				await findExactMatchCard()
			);
			expect( bundle ).not.toHaveClass( 'name-pulse-bundle-card--wide' );
			expect( within( bundle ).getByText( 'Protect your brand' ) ).toBeVisible();
			expect( bundleForDomain ).toHaveBeenCalledWith( 'icecream.com' );
			expect( onBundleShown ).toHaveBeenCalledTimes( 1 );
			expect( onBundleShown ).toHaveBeenCalledWith(
				expect.objectContaining( { bundle_group_id: 'icecream-group' } ),
				'card'
			);
		} );

		it( 'sits beside the exact-match card of the one filtered ending', async () => {
			const user = userEvent.setup();

			render( <NamePulseTestSearch query="icecream" showBundleSuggestions /> );

			await findBundleCard();
			await user.click( screen.getByRole( 'button', { name: 'Filter, no filters applied' } ) );
			await user.click( await screen.findByRole( 'option', { name: '.com' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

			await waitFor( () =>
				expect(
					document.querySelector( '.name-pulse-featured .name-pulse-bundle-card' )
				).not.toBeNull()
			);
			expect( await findExactMatchCard() ).not.toHaveClass( 'name-pulse-exact-card--wide' );
		} );

		it( 'falls back to the first top result with a bundle when the typed ending has none', async () => {
			const bundleForDomain = jest.fn( async ( fqdn: string ) => buildNamePulseBundle( fqdn ) );

			render(
				<NamePulseTestSearch
					query="icecream.blog"
					showBundleSuggestions
					bundleForDomain={ bundleForDomain }
				/>
			);

			const bundle = await findBundleCard();

			expect( bundle.closest( '.name-pulse-featured' ) ).not.toBeNull();
			expect( domainsIn( 'top' ) ).toEqual( [ 'icecream.com', 'icecream.org', 'icecream.net' ] );
			expect( bundleForDomain.mock.calls.map( ( [ fqdn ] ) => fqdn ) ).toEqual( [
				'icecream.com',
			] );
		} );

		it( 'appears under Top results when the typed domain is taken', async () => {
			render(
				<NamePulseTestSearch
					query="icecream.org"
					showBundleSuggestions
					domainAvailability={ async ( domainName ) =>
						buildAvailability( {
							domain_name: domainName,
							status: DomainAvailabilityStatus.TRANSFERRABLE,
						} )
					}
				/>
			);

			const bundle = await findBundleCard();

			expect( document.querySelector( '.name-pulse-featured' ) ).toBeNull();
			expect( isAfterTopResults( bundle ) ).toBe( true );
		} );

		it( 'appears under Top results for a bare-term search', async () => {
			render( <NamePulseTestSearch query="icecream" showBundleSuggestions /> );

			const bundle = await findBundleCard();

			expect( document.querySelector( '.name-pulse-featured' ) ).toBeNull();
			expect( isAfterTopResults( bundle ) ).toBe( true );
			// Spans the row, so it lays the price out beside the TLDs.
			expect( bundle ).toHaveClass( 'name-pulse-bundle-card--wide' );
		} );

		it( 'renders nothing when no anchor has a bundle', async () => {
			const bundleForDomain = jest.fn( async () => null );

			render(
				<NamePulseTestSearch
					query="icecream"
					showBundleSuggestions
					bundleForDomain={ bundleForDomain }
				/>
			);

			await waitFor( () => expect( bundleForDomain ).toHaveBeenCalledWith( 'icecream.com' ) );
			await waitFor( () =>
				expect( document.querySelector( '.name-pulse-bundle-card' ) ).toBeNull()
			);

			expect( bundleForDomain ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'holds its place under Top results while the bundle loads', async () => {
			render(
				<NamePulseTestSearch
					query="icecream"
					showBundleSuggestions
					bundleForDomain={ () => new Promise( () => {} ) }
				/>
			);

			const placeholder = await screen.findByRole( 'status', { name: 'Loading domain bundle' } );

			expect( placeholder ).toHaveClass( 'name-pulse-bundle-card--wide' );
			expect( isAfterTopResults( placeholder ) ).toBe( true );
		} );

		it( 'holds its place beside the exact-match card while the bundle loads', async () => {
			render(
				<NamePulseTestSearch
					query="icecream.com"
					showBundleSuggestions
					bundleForDomain={ () => new Promise( () => {} ) }
				/>
			);

			await findExactMatchCard();
			const placeholder = screen.getByRole( 'status', { name: 'Loading domain bundle' } );

			expect( placeholder.closest( '.name-pulse-featured' ) ).not.toBeNull();
			expect( placeholder ).not.toHaveClass( 'name-pulse-bundle-card--wide' );
		} );

		it( 'adds every member to the cart in one go, and explains a bundle that is gone', async () => {
			const user = userEvent.setup();
			const onBundleAddToCart = jest.fn();
			const cart = buildCart( {
				onAddBundle: jest
					.fn()
					.mockRejectedValueOnce(
						Object.assign( new Error(), { code: 'domain_bundle_unavailable' } )
					)
					.mockResolvedValueOnce( undefined ),
			} );

			render(
				<NamePulseTestSearch
					query="icecream.com"
					cart={ cart }
					showBundleSuggestions
					events={ { onBundleAddToCart } }
				/>
			);

			const bundle = within( await findBundleCard() );
			await user.click( bundle.getByRole( 'button', { name: 'Get bundle' } ) );

			expect(
				await bundle.findByText(
					'This bundle is no longer available — one or more of the domains may have just been registered.'
				)
			).toBeVisible();
			expect( onBundleAddToCart ).not.toHaveBeenCalled();

			await user.click( bundle.getByRole( 'button', { name: 'Get bundle' } ) );

			await waitFor( () => expect( onBundleAddToCart ).toHaveBeenCalledTimes( 1 ) );
			expect( cart.onAddBundle ).toHaveBeenLastCalledWith(
				expect.objectContaining( { bundle_group_id: 'icecream-group' } )
			);
		} );
	} );

	describe( 'Tracks', () => {
		const buildEvents = () => ( {
			onNamePulseSearch: jest.fn(),
			onNamePulseTracksEvent: jest.fn(),
			onSuggestionsReceive: jest.fn(),
			onSuggestionRender: jest.fn(),
			onSuggestionInteract: jest.fn(),
			onAddDomainToCart: jest.fn(),
			onQueryAvailabilityCheck: jest.fn(),
			onShowMoreResults: jest.fn(),
			onTrademarkClaimsNoticeShown: jest.fn(),
			onTrademarkClaimsNoticeClosed: jest.fn(),
		} );

		const namePulseEvent = ( events: ReturnType< typeof buildEvents >, name: string ) =>
			events.onNamePulseTracksEvent.mock.calls.find(
				( [ eventName ] ) => eventName === name
			)?.[ 1 ];

		it( 'records one search and the result set it shows, linked by id', async () => {
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream" events={ events } /> );

			await waitFor( () => expect( events.onSuggestionsReceive ).toHaveBeenCalled() );

			expect( events.onNamePulseSearch ).toHaveBeenCalledTimes( 1 );
			expect( events.onNamePulseSearch ).toHaveBeenCalledWith( 'icecream', 'prefilled', {
				search_id: expect.any( String ),
				query_shape: 'single',
			} );
			const [ [ , , { search_id: searchId } ] ] = events.onNamePulseSearch.mock.calls;

			expect( events.onSuggestionsReceive ).toHaveBeenCalledTimes( 1 );
			expect( events.onSuggestionsReceive ).toHaveBeenCalledWith(
				'icecream',
				expect.arrayContaining( [ 'creamyice.com' ] ),
				expect.any( Number ),
				expect.objectContaining( {
					search_id: searchId,
					result_set_id: expect.any( String ),
					result_count_exact: 0,
					result_count_top: 3,
					result_count_related: NAME_PULSE_SUGGESTIONS_FIXTURE.length,
				} )
			);
		} );

		it( 'reports every name with a verdict once, taken ones included, each with its own railcar', async () => {
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream" events={ events } /> );

			await waitFor( () => expect( events.onSuggestionsReceive ).toHaveBeenCalled() );
			await within( await findRow( 'icecream.net' ) ).findByText( '$24' );

			const [ [ , , , { result_set_id: resultSetId } ] ] = events.onSuggestionsReceive.mock.calls;
			const rendered = events.onSuggestionRender.mock.calls.map(
				( [ suggestion, , properties ] ) => ( { ...suggestion, ...properties } )
			);
			const names = rendered.map( ( suggestion ) => suggestion.domain_name );
			const railcars = rendered.map( ( suggestion ) => suggestion.railcar );
			const takenName = Object.entries( NAME_PULSE_AVAILABILITY_FIXTURE ).find(
				( [ name, entry ] ) => entry.is_available === false && names.includes( name )
			)?.[ 0 ];

			expect( new Set( names ).size ).toBe( names.length );
			expect( new Set( railcars ).size ).toBe( railcars.length );
			expect( rendered ).toContainEqual(
				expect.objectContaining( {
					domain_name: 'icecream.net',
					vendor: 'name_pulse_exact',
					position: 0,
					result_set_id: resultSetId,
					result_group: 'exact_tlds',
					is_ai_generated: false,
					availability_at_render: 'available',
				} )
			);
			expect( takenName ).toBeDefined();
			expect( rendered ).toContainEqual(
				expect.objectContaining( {
					domain_name: takenName,
					availability_at_render: 'unavailable',
				} )
			);
		} );

		it( 'reports no name twice when a letter is typed and deleted before the query settles', async () => {
			const events = buildEvents();

			const { rerender } = render( <NamePulseTestSearch query="icecream" events={ events } /> );

			await waitFor( () => expect( events.onSuggestionsReceive ).toHaveBeenCalled() );
			await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
			const renderCount = events.onSuggestionRender.mock.calls.length;

			rerender( <NamePulseTestSearch query="icecreamx" events={ events } /> );
			rerender( <NamePulseTestSearch query="icecream" events={ events } /> );
			await within( await findRow( 'icecream.net' ) ).findByText( '$24' );

			expect( events.onNamePulseSearch ).toHaveBeenCalledTimes( 1 );
			expect( events.onSuggestionRender ).toHaveBeenCalledTimes( renderCount );
		} );

		it( 'reports no render before its search, even while the TLD list loads', async () => {
			const events = buildEvents();
			let resolveTlds: ( tlds: string[] ) => void = () => {};

			render(
				<NamePulseTestSearch
					query="icecream"
					events={ events }
					tldsResponse={ () =>
						new Promise< string[] >( ( resolve ) => {
							resolveTlds = resolve;
						} )
					}
				/>
			);

			await findRow( 'creamyice.com' );
			expect( events.onNamePulseSearch ).not.toHaveBeenCalled();
			expect( events.onSuggestionRender ).not.toHaveBeenCalled();

			await act( async () => resolveTlds( NAME_PULSE_TLDS_FIXTURE ) );
			await waitFor( () => expect( events.onSuggestionRender ).toHaveBeenCalled() );

			const [ searchOrder ] = events.onNamePulseSearch.mock.invocationCallOrder;
			expect( Math.min( ...events.onSuggestionRender.mock.invocationCallOrder ) ).toBeGreaterThan(
				searchOrder
			);
		} );

		it( 'reports a typed domain as a full-domain search, its availability and its card', async () => {
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream.com" events={ events } /> );

			await waitFor( () =>
				expect( events.onQueryAvailabilityCheck ).toHaveBeenCalledWith(
					DomainAvailabilityStatus.AVAILABLE,
					'icecream.com',
					expect.any( Number )
				)
			);
			expect( events.onNamePulseSearch ).toHaveBeenCalledWith(
				'icecream.com',
				'prefilled',
				expect.objectContaining( { query_shape: 'fqdn' } )
			);
			await waitFor( () =>
				expect( events.onSuggestionRender ).toHaveBeenCalledWith(
					expect.objectContaining( { domain_name: 'icecream.com', position: 0 } ),
					undefined,
					expect.objectContaining( { result_group: 'exact' } )
				)
			);
		} );

		it( 'records a new search when the filter changes, and renders the rows that stay under it', async () => {
			const user = userEvent.setup();
			const events = buildEvents();
			let id = 0;
			jest.spyOn( crypto, 'randomUUID' ).mockImplementation( () => `id-${ ++id }` as never );

			render( <NamePulseTestSearch query="ice cream" events={ events } /> );

			await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
			await user.click( screen.getByRole( 'button', { name: 'Filter, no filters applied' } ) );
			await user.click( await screen.findByRole( 'option', { name: '.com' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Apply' } ) );

			await waitFor( () => expect( events.onNamePulseSearch ).toHaveBeenCalledTimes( 2 ) );
			expect( events.onNamePulseSearch.mock.calls[ 1 ][ 1 ] ).toBe( 'filter_apply' );
			await waitFor( () => expect( events.onSuggestionsReceive ).toHaveBeenCalledTimes( 2 ) );

			const renderedIn = ( resultSetId: string ) =>
				events.onSuggestionRender.mock.calls
					.filter( ( [ , , properties ] ) => properties.result_set_id === resultSetId )
					.map( ( [ suggestion ] ) => suggestion.domain_name );
			const [ first, second ] = events.onSuggestionsReceive.mock.calls.map(
				( [ , , , properties ] ) => properties.result_set_id
			);

			expect( first ).not.toBe( second );
			expect( renderedIn( first ) ).toContain( 'icecream.com' );
			expect( renderedIn( second ) ).toContain( 'icecream.com' );
		} );

		it( 'adds to the cart with the classic events, at the position it rendered at', async () => {
			const user = userEvent.setup();
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream" events={ events } /> );

			await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
			await user.click(
				within( rowFor( 'icecream.net' ) ).getByRole( 'button', { name: 'Add to cart' } )
			);

			await waitFor( () =>
				expect( events.onAddDomainToCart ).toHaveBeenCalledWith(
					'icecream.net',
					0,
					false,
					'name_pulse_exact'
				)
			);
			const renderCall = events.onSuggestionRender.mock.calls.find(
				( [ suggestion ] ) => suggestion.domain_name === 'icecream.net'
			);
			expect( events.onSuggestionInteract ).toHaveBeenCalledWith(
				expect.objectContaining( { domain_name: 'icecream.net', position: 0 } ),
				renderCall?.[ 2 ].railcar
			);
		} );

		it( 'adds to the cart without an interaction when the name has not reported its render', async () => {
			const user = userEvent.setup();
			const events = buildEvents();

			render(
				<NamePulseTestSearch
					query="icecream"
					events={ events }
					tldsResponse={ () => new Promise< string[] >( () => {} ) }
				/>
			);

			await within( await findRow( 'creamyice.com' ) ).findByText( '$24' );
			expect( events.onSuggestionRender ).not.toHaveBeenCalled();
			await user.click(
				within( rowFor( 'creamyice.com' ) ).getByRole( 'button', { name: 'Add to cart' } )
			);

			await waitFor( () =>
				expect( events.onAddDomainToCart ).toHaveBeenCalledWith(
					'creamyice.com',
					expect.any( Number ),
					false,
					expect.any( String )
				)
			);
			expect( events.onSuggestionInteract ).not.toHaveBeenCalled();
		} );

		it( 'reports "Show more" with its result group', async () => {
			const user = userEvent.setup();
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream" events={ events } /> );

			await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
			await user.click( screen.getByRole( 'button', { name: 'Show more exact matches' } ) );
			await user.click( screen.getByRole( 'button', { name: 'Show more exact matches' } ) );

			expect( events.onShowMoreResults.mock.calls ).toEqual( [
				[ 2, { result_group: 'exact_tlds' } ],
				[ 3, { result_group: 'exact_tlds' } ],
			] );
		} );

		it( 'reports a cleared search', async () => {
			const user = userEvent.setup();
			const events = buildEvents();

			render( <NamePulseTestSearch query="ice cream" events={ events } /> );

			await user.clear( screen.getByRole( 'searchbox' ) );

			expect( namePulseEvent( events, 'query_clear' ) ).toEqual( {
				previous_query_length: 9,
				previous_word_count: 2,
			} );
		} );

		it( 'reports an error instead of a result set when nothing could load', async () => {
			const events = buildEvents();

			render(
				<NamePulseTestSearch
					query="icecream"
					events={ events }
					tldsResponse={ async () => {
						throw new Error( 'Network error' );
					} }
					suggestions={ async () => {
						throw new Error( 'Network error' );
					} }
				/>
			);

			await waitFor( () =>
				expect( namePulseEvent( events, 'results_error' ) ).toEqual( {
					search_id: events.onNamePulseSearch.mock.calls[ 0 ][ 2 ].search_id,
					error_type: 'tlds_failed',
				} )
			);
			expect( events.onSuggestionsReceive ).not.toHaveBeenCalled();
		} );

		it( 'reports the result set as soon as the typed domain check fails', async () => {
			const events = buildEvents();

			render(
				<NamePulseTestSearch
					query="icecream.com"
					events={ events }
					domainAvailability={ async () => {
						throw new Error( 'Network error' );
					} }
				/>
			);

			await waitFor( () => expect( events.onSuggestionsReceive ).toHaveBeenCalledTimes( 1 ) );
			expect( namePulseEvent( events, 'results_error' ) ).toBeUndefined();
		} );

		it( 'sends the classic event when the trademark notice is closed', async () => {
			const user = userEvent.setup();
			const events = buildEvents();

			render(
				<NamePulseTestSearch
					query="icecream"
					events={ events }
					domainAvailability={ async ( domainName ) =>
						buildAvailability( {
							domain_name: domainName,
							status: DomainAvailabilityStatus.AVAILABLE,
							cost: '$24.00',
							raw_price: 24,
							trademark_claims_notice_info: { claim: { markName: 'Ice Cream' } },
						} )
					}
				/>
			);

			await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
			await user.click(
				within( rowFor( 'icecream.net' ) ).getByRole( 'button', { name: 'Add to cart' } )
			);
			await screen.findByText( 'icecream.net matches a trademark.' );
			await user.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( events.onTrademarkClaimsNoticeShown ).toHaveBeenCalled();
			// The modal closes after its exit animation.
			await waitFor( () =>
				expect( events.onTrademarkClaimsNoticeClosed ).toHaveBeenCalledWith(
					expect.objectContaining( { domain_name: 'icecream.net' } )
				)
			);
		} );

		it( 'reports View cart and a removal from the row and from the cart', async () => {
			const user = userEvent.setup();
			const events = buildEvents();
			const cart = buildCart( {
				items: [ { uuid: 'uuid-net', domain: 'icecream', tld: 'net', price: '$24' } ],
				hasItem: ( domainName: string ) => domainName === 'icecream.net',
			} );

			render( <NamePulseTestSearch query="icecream" cart={ cart } events={ events } /> );

			await findRow( 'icecream.net' );
			await user.click(
				await within( rowFor( 'icecream.net' ) ).findByRole( 'button', {
					name: 'Remove from cart',
				} )
			);

			await waitFor( () =>
				expect( namePulseEvent( events, 'remove_button_click' ) ).toEqual( {
					domain_name: 'icecream.net',
					remove_source: 'row',
					result_group: 'exact_tlds',
					position: 0,
					root_vendor: 'name_pulse_exact',
				} )
			);
			events.onNamePulseTracksEvent.mockClear();

			await user.click( screen.getByRole( 'button', { name: 'View cart' } ) );
			expect( namePulseEvent( events, 'view_cart_click' ) ).toEqual( {} );
			await user.click( await screen.findByRole( 'button', { name: 'Remove' } ) );

			await waitFor( () =>
				expect( namePulseEvent( events, 'remove_button_click' ) ).toEqual( {
					domain_name: 'icecream.net',
					remove_source: 'cart',
					is_bundle: false,
				} )
			);
		} );
	} );
} );
