/**
 * @jest-environment jsdom
 */
import { getWPCOMPluginQueryParams } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { fetchPlugin, setBrowsePluginsNoindex } from '../controller-logged-out';

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
} );
