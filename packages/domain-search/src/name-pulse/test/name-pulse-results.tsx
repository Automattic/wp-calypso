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
import {
	NAME_PULSE_AI_TIMEOUT_MS,
	NAME_PULSE_INITIAL_CHECK_SINGLE_WORD,
	NAME_PULSE_PAGE_SIZE,
} from '../helpers';
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

const findBundleCard = () => findElement( '.name-pulse-bundle-card' );

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
			{ query: 'a blog about icecream', use_ai: true, timeout: NAME_PULSE_AI_TIMEOUT_MS },
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
			name: 'Loading featured domain suggestion',
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

		await waitFor( () => expect( domainsIn( 'top' ) ).toEqual( [ 'icecream.com' ] ) );
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

			expect( bundleForDomain ).toHaveBeenCalledTimes( 1 );
			expect( document.querySelector( '.name-pulse-bundle-card' ) ).toBeNull();
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

		it( 'reports the settled search and the rendered page without the query text', async () => {
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream" events={ events } /> );

			await waitFor( () => expect( namePulseEvent( events, 'results_rendered' ) ).toBeDefined() );

			expect( namePulseEvent( events, 'search_settled' ) ).toEqual( {
				query_length: 8,
				word_count: 1,
				search_mode: 'single',
				detected_tld: undefined,
				filter_tlds_count: 0,
			} );
			expect( namePulseEvent( events, 'results_rendered' ) ).toEqual(
				expect.objectContaining( {
					search_mode: 'single',
					top_count: 3,
					suggestions_count: expect.any( Number ),
					time_to_first_result_ms: expect.any( Number ),
					time_to_complete_ms: expect.any( Number ),
					timed_out: false,
				} )
			);
			expect(
				events.onNamePulseTracksEvent.mock.calls.filter( ( [ name ] ) => name === 'search_settled' )
			).toHaveLength( 1 );
		} );

		it( 'sends the classic suggestions and render events', async () => {
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream" events={ events } /> );

			await waitFor( () =>
				expect( events.onSuggestionsReceive ).toHaveBeenCalledWith(
					'icecream',
					expect.arrayContaining( [ 'creamyice.com' ] ),
					expect.any( Number )
				)
			);
			await waitFor( () =>
				expect( events.onSuggestionRender ).toHaveBeenCalledWith(
					expect.objectContaining( { domain_name: 'icecream.net', vendor: 'name_pulse_exact' } )
				)
			);
			expect( events.onSuggestionsReceive ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'sends the classic availability event for a typed domain', async () => {
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream.com" events={ events } /> );

			await waitFor( () =>
				expect( events.onQueryAvailabilityCheck ).toHaveBeenCalledWith(
					DomainAvailabilityStatus.AVAILABLE,
					'icecream.com',
					expect.any( Number )
				)
			);
			expect( namePulseEvent( events, 'search_settled' ) ).toEqual(
				expect.objectContaining( { search_mode: 'fqdn', detected_tld: 'com' } )
			);
		} );

		it( 'reports an add to cart with its section, position and source', async () => {
			const user = userEvent.setup();
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream" events={ events } /> );

			await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
			await user.click(
				within( rowFor( 'icecream.net' ) ).getByRole( 'button', { name: 'Add to cart' } )
			);

			await waitFor( () =>
				expect( namePulseEvent( events, 'result_add_to_cart' ) ).toEqual(
					expect.objectContaining( {
						results_section: 'exact',
						position: 0,
						tld: 'net',
						name_pulse_source: 'exact',
						availability_status: 'available',
						is_premium: false,
					} )
				)
			);
			expect( events.onSuggestionInteract ).toHaveBeenCalledWith(
				expect.objectContaining( { domain_name: 'icecream.net', position: 0 } )
			);
			expect( events.onAddDomainToCart ).toHaveBeenCalledWith(
				'icecream.net',
				0,
				false,
				'name_pulse_exact'
			);
		} );

		it( 'reports "Show more" with the rows shown before and after', async () => {
			const user = userEvent.setup();
			const events = buildEvents();

			render( <NamePulseTestSearch query="icecream" events={ events } /> );

			await within( await findRow( 'icecream.net' ) ).findByText( '$24' );
			await user.click( screen.getByRole( 'button', { name: 'Show more exact matches' } ) );

			expect( events.onShowMoreResults ).toHaveBeenCalledWith( 2 );
			expect( namePulseEvent( events, 'show_more_click' ) ).toEqual( {
				results_section: 'exact',
				visible_before: NAME_PULSE_PAGE_SIZE,
				visible_after: NAME_PULSE_PAGE_SIZE * 2,
			} );
		} );

		it( 'reports a cleared search', async () => {
			const user = userEvent.setup();
			const events = buildEvents();

			render( <NamePulseTestSearch query="ice cream" events={ events } /> );

			await user.clear( screen.getByRole( 'searchbox' ) );

			expect( namePulseEvent( events, 'search_cleared' ) ).toEqual( {
				previous_query_length: 9,
				previous_word_count: 2,
			} );
		} );

		it( 'reports provider errors in the suggestions response', async () => {
			const events = buildEvents();

			render(
				<NamePulseTestSearch
					query="icecream"
					events={ events }
					suggestions={ async () => ( {
						suggestions: NAME_PULSE_SUGGESTIONS_FIXTURE,
						errors: [ { provider: 'verisign', code: 'timeout', message: 'Timed out' } ],
					} ) }
				/>
			);

			await waitFor( () =>
				expect( namePulseEvent( events, 'suggestions_failed' ) ).toEqual( {
					use_ai: false,
					request_failed: false,
					provider_error_codes: 'verisign:timeout',
					result_count: NAME_PULSE_SUGGESTIONS_FIXTURE.length,
				} )
			);
		} );

		it( 'reports an availability batch that fails', async () => {
			const events = buildEvents();

			render(
				<NamePulseTestSearch
					query="icecream"
					events={ events }
					availability={ async () => {
						throw new Error( 'Network error' );
					} }
				/>
			);

			await waitFor( () =>
				expect( namePulseEvent( events, 'availability_failed' ) ).toEqual(
					expect.objectContaining( { reason: 'network', failed_count: expect.any( Number ) } )
				)
			);
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
			// The modal reports the close once its exit animation ends.
			await waitFor( () =>
				expect( events.onTrademarkClaimsNoticeClosed ).toHaveBeenCalledWith(
					expect.objectContaining( { domain_name: 'icecream.net' } )
				)
			);
		} );
	} );
} );
