/** @jest-environment jsdom */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import i18n from 'i18n-calypso';
import { renderToString } from 'react-dom/server';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { getESPluginsQueryParams } from 'calypso/data/marketplace/use-es-query';
import wpcom from 'calypso/lib/wp';
import {
	fetchCategoryPlugins,
	fetchPlugins,
	setPluginsResultsPageSSR,
} from '../../controller-logged-out';
import PluginsCategoryResultsPage from '../../plugins-category-results-page';
import PluginsSearchResultPage from '../../plugins-search-results-page';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn() } } ) );
jest.mock( '../../plugins-discovery-page/upgrade-nudge', () => () => null );
jest.mock( '../../plugins-discovery-page', () => ( { PaidPluginsSection: () => null } ) );
jest.mock( '../../hooks/use-is-marketplace-redesign-enabled', () => ( {
	useIsMarketplaceRedesignEnabled: () => false,
} ) );
jest.mock( '../../plugins-browser-list', () => ( { plugins } ) => (
	<ul>
		{ plugins.map( ( plugin ) => (
			<li key={ plugin.slug }>
				<a href={ `/plugins/${ plugin.slug }` }>{ plugin.name }</a>
			</li>
		) ) }
	</ul>
) );

beforeEach( () => wpcom.req.get.mockReset() );

test.each( [ { page: '2' }, { page: 'invalid' }, { s: 'contact form' } ] )(
	'enables result-page SSR for query %p',
	( query ) => {
		const context = { query, params: { category: 'seo' }, serverSideRender: false };
		const next = jest.fn();
		setPluginsResultsPageSSR( context, next );
		expect( context.serverSideRender ).toBe( true );
		expect( next ).toHaveBeenCalledTimes( 1 );
	}
);

test( 'preserves the default SSR decision for other discovery requests', () => {
	const context = { query: { source: 'test', page: '2' }, params: {}, serverSideRender: false };
	setPluginsResultsPageSSR( context, jest.fn() );
	expect( context.serverSideRender ).toBe( false );
} );

test.each( [ 'popular', 'seo', 'wpbeginner', 'search', 'paid', 'featured' ] )(
	'prefetches and renders page 2 of %s using the client query',
	async ( category ) => {
		const isSearch = category === 'search';
		const path = isSearch
			? '/es/plugins?s=contact+form&page=2&source=test'
			: `/es/plugins/browse/${ category }?page=2&source=test`;
		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const store = createStore( ( state ) => state, {
			currentUser: { id: null },
			ui: { selectedSiteId: null },
		} );
		const context = {
			path,
			lang: 'es',
			params: isSearch ? {} : { category },
			query: { page: '2', ...( isSearch && { s: 'contact form' } ) },
			queryClient,
			store,
			isServerSide: true,
			res: {
				status: jest.fn(),
				req: { useragent: { isBot: false }, logger: { error: jest.fn() } },
			},
		};
		const completeList = Array.from( { length: 45 }, ( _, index ) => ( {
			slug: `local-${ index }`,
			name: `Local ${ index }`,
		} ) );
		wpcom.req.get.mockImplementation( ( request, params ) => {
			if ( request === '/products' ) {
				return Promise.resolve( {} );
			}
			if ( request.path === '/marketplace/products' ) {
				return Promise.resolve( { results: completeList } );
			}
			if ( request.path === '/plugins/featured' ) {
				return Promise.resolve( completeList );
			}
			return Promise.resolve( {
				data: {
					results: [
						{
							fields: {
								slug: `offset-${ params.from }`,
								plugin: { title: `Offset ${ params.from }` },
							},
							railcar: {},
						},
					],
					total: 65,
					page_handle: 'cursor',
				},
			} );
		} );
		const next = jest.fn();
		await ( isSearch ? fetchPlugins : fetchCategoryPlugins )( context, next );
		expect( next ).toHaveBeenCalledTimes( 1 );
		const props = { path, page: 2, sites: [], isLoggedIn: false };
		const page = isSearch ? (
			<PluginsSearchResultPage
				{ ...props }
				search="contact form"
				setIsFetchingPluginsBySearchTerm={ jest.fn() }
			/>
		) : (
			<PluginsCategoryResultsPage { ...props } category={ category } />
		);
		// The locale is normally established by ssrSetupLocale before the prefetch.
		i18n.setLocale( { '': { localeSlug: 'es', plural_forms: 'nplurals=2; plural=(n != 1);' } } );
		const html = renderToString(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>{ page }</QueryClientProvider>
			</Provider>
		);
		i18n.setLocale();
		const local = [ 'paid', 'featured' ].includes( category );
		expect( html ).toContain( local ? 'Local 20' : 'Offset 20' );
		expect( html ).not.toContain( local ? '>Local 0<' : '>Offset 0<' );
		expect( html ).toContain( 'Page 2 of' );
		expect( html ).toContain( 'rel="prev"' );
		expect( html ).toContain( 'rel="next"' );
		expect( html ).toContain( 'source=test' );
		expect( html ).toContain( isSearch ? 's=contact+form' : `/es/plugins/browse/${ category }?` );
		queryClient.clear();
	}
);

test( 'prefetches page 1 when an Elasticsearch URL exceeds the API window', async () => {
	const prefetchQuery = jest.fn( () => Promise.resolve() );
	const context = {
		path: '/plugins/browse/popular?page=12',
		lang: 'en',
		params: { category: 'popular' },
		query: { page: '12' },
		isServerSide: true,
		queryClient: { prefetchQuery, fetchQuery: () => Promise.resolve( {} ) },
		store: { dispatch: jest.fn() },
		res: { req: { logger: { error: jest.fn() } } },
	};
	await fetchCategoryPlugins( context, jest.fn() );
	expect( prefetchQuery.mock.calls[ 0 ][ 0 ].queryKey ).toEqual(
		getESPluginsQueryParams(
			{
				locale: 'en',
				category: 'popular',
				page: 1,
				tag: '',
				searchTerm: undefined,
				slugs: undefined,
			},
			'en'
		).queryKey
	);
} );
