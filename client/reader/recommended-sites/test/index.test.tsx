/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import RecommendedSites, { seed as recommendedSitesSeed } from '..';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

jest.mock( '@automattic/viewport-react', () => ( {
	useBreakpoint: jest.fn( () => false ),
} ) );

jest.mock( '../site', () => ( props: { siteId: number; feedId?: number } ) => (
	<li data-testid="recommended-site">{ `${ props.siteId }:${ props.feedId ?? '' }` }</li>
) );

jest.mock( '../placeholder', () => ( {
	RecommendedSitesPlaceholder: ( { count }: { count: number } ) => (
		<>
			{ Array.from( { length: count }, ( _, index ) => (
				<li key={ index } data-testid="recommended-site-placeholder" />
			) ) }
		</>
	),
} ) );

const makeStore = ( state: Record< string, unknown > ) => {
	const actions: unknown[] = [];
	const store = createStore( ( currentState = state, action ) => {
		actions.push( action );
		return currentState;
	} );
	return { store, actions };
};

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const renderWithProviders = (
	children: ReactNode,
	{
		queryClient = makeQueryClient(),
		state = {
			currentUser: { user: { email_verified: true } },
			reader: { siteBlocks: { items: {} } },
		},
	}: { queryClient?: QueryClient; state?: Record< string, unknown > } = {}
) => {
	const { store, actions } = makeStore( state );
	return {
		...render(
			<QueryClientProvider client={ queryClient }>
				<Provider store={ store }>{ children }</Provider>
			</QueryClientProvider>
		),
		store,
		actions,
		queryClient,
	};
};

const apiSite = ( blogId: number, feedId: number, name: string ) => ( {
	blog_id: blogId,
	description: `${ name } description`,
	feed_id: feedId,
	feed_url: `https://${ name }.test/feed`,
	ID: blogId,
	name,
	railcar: {
		railcar: `railcar-${ blogId }`,
		fetch_algo: 'algo',
		fetch_lang: 'en',
		fetch_position: feedId,
		rec_blog_id: String( blogId ),
	},
	URL: `https://${ name }.test`,
} );

describe( 'RecommendedSites', () => {
	afterEach( () => nock.cleanAll() );

	it( 'renders nothing when the user email is not verified', () => {
		const { container } = renderWithProviders( <RecommendedSites />, {
			state: {
				currentUser: { user: { email_verified: false } },
				reader: { siteBlocks: { items: {} } },
			},
		} );

		expect( container.firstChild ).toBeNull();
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'renders two visible unblocked recommendations and placeholders only when needed', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query(
				( query ) =>
					query.number === '4' &&
					query.offset === '0' &&
					query.seed === String( recommendedSitesSeed ) &&
					query.posts_per_site === '0'
			)
			.reply( 200, {
				algorithm: 'algo',
				sites: [ apiSite( 101, 201, 'one' ), apiSite( 102, 202, 'two' ) ],
			} );

		renderWithProviders( <RecommendedSites /> );

		await waitFor( () => expect( screen.getAllByTestId( 'recommended-site' ) ).toHaveLength( 2 ) );
		expect( screen.queryByTestId( 'recommended-site-placeholder' ) ).not.toBeInTheDocument();
		expect( screen.getByText( '101:201' ) ).toBeInTheDocument();
		expect( screen.getByText( '102:202' ) ).toBeInTheDocument();
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'filters blocked sites before slicing to the display threshold', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( true )
			.reply( 200, {
				algorithm: 'algo',
				sites: [
					apiSite( 101, 201, 'blocked' ),
					apiSite( 102, 202, 'visible-two' ),
					apiSite( 103, 203, 'visible-three' ),
				],
			} );

		renderWithProviders( <RecommendedSites />, {
			state: {
				currentUser: { user: { email_verified: true } },
				reader: { siteBlocks: { items: { 101: true } } },
			},
		} );

		await waitFor( () => expect( screen.getAllByTestId( 'recommended-site' ) ).toHaveLength( 2 ) );
		expect( screen.getByText( '102:202' ) ).toBeInTheDocument();
		expect( screen.getByText( '103:203' ) ).toBeInTheDocument();
	} );

	it( 'fetches another recommendations page when visible recommendations fall below the display threshold', async () => {
		const firstPage = nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query(
				( query ) =>
					query.number === '4' &&
					query.offset === '0' &&
					query.seed === String( recommendedSitesSeed ) &&
					query.posts_per_site === '0'
			)
			.reply( 200, {
				algorithm: 'algo',
				sites: [ apiSite( 101, 201, 'blocked' ), apiSite( 102, 202, 'visible' ) ],
			} );
		const secondPage = nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query(
				( query ) =>
					query.number === '4' &&
					query.offset === '4' &&
					query.seed === String( recommendedSitesSeed ) &&
					query.posts_per_site === '0'
			)
			.reply( 200, {
				algorithm: 'algo',
				sites: [ apiSite( 103, 203, 'refill' ) ],
			} );

		renderWithProviders( <RecommendedSites />, {
			state: {
				currentUser: { user: { email_verified: true } },
				reader: { siteBlocks: { items: { 101: true } } },
			},
		} );

		await waitFor( () => expect( screen.getAllByTestId( 'recommended-site' ) ).toHaveLength( 2 ) );
		expect( screen.getByText( '102:202' ) ).toBeInTheDocument();
		expect( screen.getByText( '103:203' ) ).toBeInTheDocument();
		expect( firstPage.isDone() ).toBe( true );
		expect( secondPage.isDone() ).toBe( true );
	} );

	it( 'does not repeatedly auto-refill after a next page error', async () => {
		let nextPageAttempts = 0;
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query(
				( query ) =>
					query.number === '4' &&
					query.offset === '0' &&
					query.seed === String( recommendedSitesSeed ) &&
					query.posts_per_site === '0'
			)
			.reply( 200, {
				algorithm: 'algo',
				sites: [ apiSite( 101, 201, 'visible' ) ],
			} );
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query(
				( query ) =>
					query.number === '4' &&
					query.offset === '4' &&
					query.seed === String( recommendedSitesSeed ) &&
					query.posts_per_site === '0'
			)
			.twice()
			.reply( () => {
				nextPageAttempts++;
				return [ 500, { error: 'refill_failed' } ];
			} );

		renderWithProviders( <RecommendedSites /> );

		await waitFor( () => expect( nextPageAttempts ).toBe( 1 ) );
		await new Promise( ( resolve ) => setTimeout( resolve, 100 ) );

		expect( nextPageAttempts ).toBe( 1 );
		expect( screen.getAllByTestId( 'recommended-site' ) ).toHaveLength( 1 );
		expect( screen.getAllByTestId( 'recommended-site-placeholder' ) ).toHaveLength( 1 );
	} );
} );
