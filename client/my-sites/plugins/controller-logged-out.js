import { BASE_STALE_TIME } from 'calypso/data/marketplace/constants';
import { getFetchESPluginsInfinite } from 'calypso/data/marketplace/use-es-query';
import {
	getFetchWPCOMFeaturedPlugins,
	getFetchWPCOMPlugins,
	getFetchWPCOMPlugin,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import {
	getFetchWPORGPlugins,
	getFetchWPORGInfinitePlugins,
} from 'calypso/data/marketplace/use-wporg-plugin-query';
import { getSiteFragment } from 'calypso/lib/route';
import { isEnabled } from 'calypso/server/config';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin as getWporgPluginSelector } from 'calypso/state/plugins/wporg/selectors';
import { requestProductsList } from 'calypso/state/products-list/actions';
import {
	getProductsList,
	isMarketplaceProduct as isMarketplaceProductSelector,
} from 'calypso/state/products-list/selectors';
import { getCategories } from './categories/use-categories';
import { getCategoryForPluginsBrowser } from './controller';

function getProps( context ) {
	const searchTerm = context.query.s;
	const category = getCategoryForPluginsBrowser( context );

	if ( searchTerm && context.isServerSide && ! context.serverSideRender ) {
		context.serverSideRender = true;
	}

	const props = {
		path: context.path,
		category,
		searchTerm,
		search: searchTerm,
		locale: context.lang,
		tag: category || '',
	};
	return props;
}

function prefetchPluginsData( queryClient, fetchParams, infinite ) {
	const queryType = infinite ? 'fetchInfiniteQuery' : 'fetchQuery';

	return queryClient[ queryType ]( ...fetchParams, {
		enabled: true,
		staleTime: BASE_STALE_TIME,
		refetchOnMount: false,
	} ).catch( () => {} );
}
const prefetchMarketplacePlugin = ( queryClient, pluginSlug ) =>
	prefetchPluginsData( queryClient, getFetchWPCOMPlugin( pluginSlug ) );

const prefetchPaidPlugins = ( queryClient, options ) =>
	prefetchPluginsData(
		queryClient,
		getFetchWPCOMPlugins( true, 'all', options.search, options.tag )
	);

const prefetchPopularPlugins = ( queryClient, options ) =>
	prefetchPluginsData( queryClient, getFetchWPORGPlugins( { ...options, category: 'popular' } ) );

const prefetchFeaturedPlugins = ( queryClient ) =>
	prefetchPluginsData( queryClient, getFetchWPCOMFeaturedPlugins() );

const prefetchSearchedPlugins = ( queryClient, options ) => {
	const getFetchFn = isEnabled( 'marketplace-jetpack-plugin-search' )
		? getFetchESPluginsInfinite
		: getFetchWPORGInfinitePlugins;
	return [
		prefetchPluginsData( queryClient, getFetchFn( { ...options, category: undefined } ), true ),
		prefetchPluginsData( queryClient, getFetchWPCOMPlugins( true, 'all', options.search, '' ) ),
	];
};

const prefetchCategoryPlugins = ( queryClient, options ) =>
	prefetchPluginsData( queryClient, getFetchWPORGInfinitePlugins( options ), true );

const prefetchProductList = ( store ) => {
	const productsList = getProductsList( store.getState() );
	if ( Object.values( productsList ).length === 0 ) {
		return requestProductsList( { type: 'all' } )( store.dispatch );
	}
};

export async function fetchPlugin( context, next ) {
	const { queryClient, store } = context;

	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getProps( context ),
	};

	const pluginSlug = context.params?.plugin;

	await prefetchProductList( store );

	const isMarketplaceProduct = isMarketplaceProductSelector( store.getState(), pluginSlug );

	let data = getWporgPluginSelector( store.getState(), pluginSlug );
	if ( isMarketplaceProduct ) {
		data = await prefetchMarketplacePlugin( queryClient, pluginSlug );
	} else if ( ! data ) {
		await store.dispatch( wporgFetchPluginData( pluginSlug, options.locale ) );
		data = getWporgPluginSelector( store.getState(), pluginSlug );
	}

	if ( ! data || data.error ) {
		return next( 'route' );
	}

	next();
}

export async function fetchPlugins( context, next ) {
	const { queryClient, store } = context;

	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getProps( context ),
	};

	await Promise.all( [
		prefetchProductList( store ),
		...( options.search
			? prefetchSearchedPlugins( queryClient, options )
			: [
					prefetchPaidPlugins( queryClient, options ),
					prefetchPopularPlugins( queryClient, options ),
					prefetchFeaturedPlugins( queryClient, options ),
			  ] ),
	] );

	next();
}

export async function fetchCategoryPlugins( context, next ) {
	const { queryClient, store } = context;

	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getProps( context ),
	};
	const categories = getCategories();
	const categoryTags = categories[ options.category || '' ]?.tags || [ options.category ];
	options.tag = categoryTags.join( ',' );

	await Promise.all( [
		prefetchProductList( store ),
		prefetchPaidPlugins( queryClient, options ),
		...( options.search
			? prefetchSearchedPlugins( queryClient, options )
			: [ prefetchCategoryPlugins( queryClient, options ) ] ),
	] );

	next();
}

export function validatePlugin( { path, params: { plugin } }, next ) {
	const siteFragment = getSiteFragment( path );

	if ( siteFragment || Number.isInteger( parseInt( plugin, 10 ) ) ) {
		return next( 'route' );
	}
	next();
}

export function skipIfLoggedIn( context, next ) {
	if ( context.isLoggedIn ) {
		return next( 'route' );
	}

	next();
}
