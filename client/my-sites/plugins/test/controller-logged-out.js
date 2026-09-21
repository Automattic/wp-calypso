/**
 * @jest-environment jsdom
 */
import { getWPCOMPluginQueryParams } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { fetchPluginInformation } from 'calypso/lib/wporg';
import { fetchPlugin, fetchPlugins, setBrowsePluginsNoindex } from '../controller-logged-out';

jest.mock( 'calypso/lib/wporg', () => ( {
	fetchPluginInformation: jest.fn(),
	fetchPluginsList: jest.fn(),
} ) );

function makeContext( category, { isServerSide = true, loggedIn = false, meta = [] } = {} ) {
	const dispatched = [];
	return {
		isServerSide,
		params: { category },
		store: {
			getState: () => ( {
				// isUserLoggedIn() reads currentUser?.id !== null, so an explicit
				// null id is required to represent a logged-out request.
				currentUser: { id: loggedIn ? 123 : null },
				documentHead: { meta },
			} ),
			dispatch: ( action ) => dispatched.push( action ),
		},
		dispatched,
	};
}

const robotsMeta = ( context ) =>
	context.dispatched
		.flatMap( ( action ) => action.meta || [] )
		.filter( ( { name } ) => name === 'robots' );

describe( 'setBrowsePluginsNoindex', () => {
	test( 'adds noindex robots meta for an uncurated tag fallthrough term', () => {
		const next = jest.fn();
		const context = makeContext( 'email-money-transfer' );

		setBrowsePluginsNoindex( context, next );

		expect( robotsMeta( context ) ).toEqual( [ { name: 'robots', content: 'noindex' } ] );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does NOT add noindex for a curated ALLOWED_CATEGORIES term', () => {
		const next = jest.fn();
		const context = makeContext( 'seo' );

		setBrowsePluginsNoindex( context, next );

		expect( context.dispatched ).toHaveLength( 0 );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'matches curated categories case-insensitively (e.g. jobBoards via jobboards)', () => {
		const upper = makeContext( 'SEO' );
		setBrowsePluginsNoindex( upper, jest.fn() );
		expect( upper.dispatched ).toHaveLength( 0 );

		// `jobBoards` is camelCase in the allowlist but lowercased in URLs.
		const camel = makeContext( 'jobboards' );
		setBrowsePluginsNoindex( camel, jest.fn() );
		expect( camel.dispatched ).toHaveLength( 0 );
	} );

	test( 'does nothing on client-side (non-SSR) requests', () => {
		const next = jest.fn();
		const context = makeContext( 'email-money-transfer', { isServerSide: false } );

		setBrowsePluginsNoindex( context, next );

		expect( context.dispatched ).toHaveLength( 0 );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'does nothing for logged-in users', () => {
		const next = jest.fn();
		const context = makeContext( 'email-money-transfer', { loggedIn: true } );

		setBrowsePluginsNoindex( context, next );

		expect( context.dispatched ).toHaveLength( 0 );
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'preserves existing non-robots meta and replaces any prior robots meta', () => {
		const next = jest.fn();
		const context = makeContext( 'email-money-transfer', {
			meta: [
				{ name: 'description', content: 'Plugins' },
				{ name: 'robots', content: 'index' },
			],
		} );

		setBrowsePluginsNoindex( context, next );

		const { meta } = context.dispatched[ 0 ];
		expect( meta ).toContainEqual( { name: 'description', content: 'Plugins' } );
		expect( meta.filter( ( { name } ) => name === 'robots' ) ).toEqual( [
			{ name: 'robots', content: 'noindex' },
		] );
	} );
} );

const PLUGIN_SLUG = 'sensei-pro';

/**
 * A stand-in for the react-query client that serves data the test seeds.
 *
 * `fetchPlugin` reads the prefetched product back out of the query cache, so
 * the fake only has to answer `getQueryData` for the seeded key. The prefetch
 * methods resolve empty, which keeps the test off the network.
 * @param {Object|undefined} cachedProduct The product to serve for PLUGIN_SLUG
 * @returns {Object} The fake query client
 */
function makeQueryClient( cachedProduct ) {
	const { queryKey } = getWPCOMPluginQueryParams( PLUGIN_SLUG );
	const cacheKey = JSON.stringify( queryKey );

	return {
		fetchQuery: () => Promise.resolve( {} ),
		prefetchQuery: () => Promise.resolve(),
		prefetchInfiniteQuery: () => Promise.resolve(),
		getQueryData: ( key ) => ( JSON.stringify( key ) === cacheKey ? cachedProduct : undefined ),
	};
}

function makePluginContext( { cachedProduct, isMarketplaceProduct = true } = {} ) {
	// `isMarketplaceProduct` reads the products list, which routes the prefetch
	// to the marketplace API instead of WordPress.org.
	const items = isMarketplaceProduct
		? {
				[ PLUGIN_SLUG ]: {
					product_type: 'marketplace_plugin',
					billing_product_slug: PLUGIN_SLUG,
				},
			}
		: {};

	return {
		isServerSide: true,
		path: `/plugins/${ PLUGIN_SLUG }`,
		lang: 'en',
		params: { plugin: PLUGIN_SLUG },
		queryClient: makeQueryClient( cachedProduct ),
		store: {
			getState: () => ( {
				productsList: { items },
				plugins: { wporg: { items: {}, fetchingItems: {} } },
			} ),
			dispatch: () => {},
		},
		res: {
			redirect: jest.fn(),
			status: jest.fn(),
			req: { logger: { error: jest.fn() }, useragent: { isBot: false } },
		},
	};
}

describe( 'fetchPlugin', () => {
	test( 'redirects a retired marketplace product to /plugins', async () => {
		const next = jest.fn();
		const context = makePluginContext( {
			cachedProduct: { slug: PLUGIN_SLUG, is_retired: true },
		} );

		await fetchPlugin( context, next );

		expect( context.res.redirect ).toHaveBeenCalledWith( 302, '/plugins' );
		expect( next ).not.toHaveBeenCalled();
	} );

	test( 'keeps the locale in the redirect for a localized request', async () => {
		const next = jest.fn();
		const context = makePluginContext( {
			isMarketplaceProduct: true,
			cachedProduct: { slug: PLUGIN_SLUG, is_retired: true },
		} );
		context.path = `/de/plugins/${ PLUGIN_SLUG }`;
		context.lang = 'de';
		context.params.lang = 'de';

		await fetchPlugin( context, next );

		expect( context.res.redirect ).toHaveBeenCalledWith( 302, '/de/plugins' );
		expect( next ).not.toHaveBeenCalled();
	} );

	test( 'renders normally when is_retired is false', async () => {
		const next = jest.fn();
		const context = makePluginContext( {
			cachedProduct: { slug: PLUGIN_SLUG, is_retired: false },
		} );

		await fetchPlugin( context, next );

		expect( context.res.redirect ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders normally when the API omits is_retired', async () => {
		const next = jest.fn();
		const context = makePluginContext( { cachedProduct: { slug: PLUGIN_SLUG } } );

		await fetchPlugin( context, next );

		expect( context.res.redirect ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'renders normally for a WordPress.org plugin with no cached product', async () => {
		const next = jest.fn();
		const context = makePluginContext( { isMarketplaceProduct: false } );

		await fetchPlugin( context, next );

		expect( context.res.redirect ).not.toHaveBeenCalled();
		expect( next ).toHaveBeenCalledTimes( 1 );
	} );

	test( 'logs the failing URL when the WordPress.org plugin fetch fails', async () => {
		const failure = new TypeError( 'fetch failed' );
		failure.cause = new Error( 'connect ETIMEDOUT 192.0.66.66:443' );
		// The fetch layer attaches the URL it was requesting.
		failure.url = 'https://api.wordpress.org/plugins/info/1.2/?action=plugin_information';
		fetchPluginInformation.mockRejectedValueOnce( failure );

		const context = makePluginContext( { isMarketplaceProduct: false } );
		// Run thunks and track wporg receives like the real redux store would.
		const { store } = context;
		const wporgItems = {};
		store.getState = () => ( {
			productsList: { items: {} },
			plugins: { wporg: { items: wporgItems, fetchingItems: {} } },
			currentUser: { id: null },
		} );
		store.dispatch = ( action ) => {
			if ( typeof action === 'function' ) {
				return action( store.dispatch, store.getState );
			}
			if ( action.type === 'PLUGINS_WPORG_PLUGIN_RECEIVE' ) {
				wporgItems[ action.pluginSlug ] = action.error ? { error: action.error } : action.data;
			}
			return action;
		};

		const next = jest.fn();
		await fetchPlugin( context, next );

		expect( next ).toHaveBeenCalledWith( 'route' );
		const logCall = context.res.req.logger.error.mock.calls[ 0 ][ 0 ];
		expect( logCall.message ).toBe( 'fetch failed' );
		expect( logCall.extra.prefetchUrl ).toBe( failure.url );
		expect( logCall.extra.prefetchCause ).toBe( 'Error: connect ETIMEDOUT 192.0.66.66:443' );
	} );
} );

describe( 'fetchPlugins prefetch error logging', () => {
	const neverSettles = () => new Promise( () => {} );

	function makeBrowserContext( fetchQuery ) {
		return {
			isServerSide: true,
			path: '/plugins',
			lang: 'en',
			params: {},
			queryClient: {
				fetchQuery,
				prefetchQuery: neverSettles,
				prefetchInfiniteQuery: neverSettles,
				getQueryData: () => undefined,
			},
			store: { getState: () => ( {} ), dispatch: () => {} },
			res: {
				status: jest.fn(),
				req: { logger: { error: jest.fn() }, useragent: { isBot: false } },
			},
		};
	}

	test( 'logs the failing prefetch URL and its undici cause', async () => {
		const failure = new TypeError( 'fetch failed' );
		failure.cause = new Error( 'connect ETIMEDOUT 192.0.66.2:443' );
		// The fetch layer attaches the URL it was requesting.
		failure.url = 'https://public-api.wordpress.com/rest/v1.1/products';
		const context = makeBrowserContext( () => Promise.reject( failure ) );

		await fetchPlugins( context, jest.fn() );

		expect( context.serverSideRender ).toBe( false );
		const logCall = context.res.req.logger.error.mock.calls[ 0 ][ 0 ];
		expect( logCall.feature ).toBe( 'calypso_ssr' );
		expect( logCall.message ).toBe( 'fetch failed' );
		expect( logCall.extra.prefetchUrl ).toBe(
			'https://public-api.wordpress.com/rest/v1.1/products'
		);
		expect( logCall.extra.prefetchCause ).toBe( 'Error: connect ETIMEDOUT 192.0.66.2:443' );
		// The prefetches that never settled are reported as still pending.
		expect( logCall.extra.pendingPrefetches ).toEqual(
			expect.arrayContaining( [ 'paid-plugins', 'popular-plugins', 'featured-plugins' ] )
		);
		expect( logCall.extra.pendingPrefetches ).not.toContain( 'products-list' );
	} );

	test( 'logs the still-pending prefetches when the timebox fires', async () => {
		jest.useFakeTimers();
		const context = makeBrowserContext( neverSettles );

		const promise = fetchPlugins( context, jest.fn() );
		await jest.advanceTimersByTimeAsync( 2000 );
		await promise;

		const logCall = context.res.req.logger.error.mock.calls[ 0 ][ 0 ];
		expect( logCall.message ).toBe( 'plugins prefetch timeout' );
		expect( logCall.extra.prefetchUrl ).toBeUndefined();
		expect( logCall.extra.pendingPrefetches ).toEqual( [
			'products-list',
			'paid-plugins',
			'popular-plugins',
			'featured-plugins',
		] );
		jest.useRealTimers();
	} );
} );
