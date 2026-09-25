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

const findNotice = async () => {
	await waitFor( () => expect( document.querySelector( '.name-pulse-notice' ) ).not.toBeNull() );

	return document.querySelector( '.name-pulse-notice' ) as HTMLElement;
};

const findExactMatchCard = async () => {
	await waitFor( () =>
		expect( document.querySelector( '.name-pulse-exact-card[data-domain]' ) ).not.toBeNull()
	);

	return document.querySelector( '.name-pulse-exact-card[data-domain]' ) as HTMLElement;
};

const findBundleCard = async () => {
	await waitFor( () => expect( document.querySelector( '.bundle-card' ) ).not.toBeNull() );

	return document.querySelector( '.bundle-card' ) as HTMLElement;
};

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

	it( 'features an available typed FQDN in its own card, out of Top results and the grid', async () => {
		render( <NamePulseTestSearch query="icecream.net" /> );

		const card = within( await findExactMatchCard() );
		expect( card.getByText( 'Exact match' ) ).toBeVisible();
		expect( card.getByText( "It's available!" ) ).toBeVisible();
		expect( card.getByText( '$24' ) ).toBeVisible();
		expect( card.getByRole( 'button', { name: 'Add to cart' } ) ).toBeEnabled();

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
			'We don’t recognize .d, so we’re showing results for “icecreamd”. Try .com or .blog instead.'
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
			'We don’t recognize .d, so we’re showing results for “sorbetd”. Try .com or .blog instead.'
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
		expect( await screen.findByRole( 'img', { name: 'Checking…' } ) ).toHaveClass(
			'name-pulse-exact-card--skeleton'
		);
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

	describe( 'bundle card', () => {
		it( 'is not requested when bundle suggestions are off', async () => {
			const bundleForDomain = jest.fn( async () => null );

			render( <NamePulseTestSearch query="icecream.com" bundleForDomain={ bundleForDomain } /> );

			await findExactMatchCard();
			await waitFor( () => expect( domainsIn( 'top' ) ).toHaveLength( 3 ) );

			expect( bundleForDomain ).not.toHaveBeenCalled();
			expect( document.querySelector( '.bundle-card' ) ).toBeNull();
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
				'icecream.blog',
				'icecream.com',
				'icecream.org',
				'icecream.net',
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

			await waitFor( () => expect( bundleForDomain ).toHaveBeenCalledTimes( 3 ) );

			expect( document.querySelector( '.bundle-card' ) ).toBeNull();
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
} );
