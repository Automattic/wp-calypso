import { BASE_STALE_TIME } from 'calypso/data/marketplace/constants';
import {
	getFetchWPCOMFeaturedPlugins,
	getFetchWPCOMPlugins,
	getFetchWPCOMPlugin,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import {
	getFetchWPORGPlugins,
	getFetchWPORGInfinitePlugins,
} from 'calypso/data/marketplace/use-wporg-plugin-query';
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

	if ( searchTerm && ! context.serverSideRender ) {
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

export async function fetchPlugin( context, next ) {
	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getProps( context ),
	};

	const { queryClient } = context;
	const store = context.store;

	const pluginSlug = context.params?.plugin;
	const productsList = getProductsList( store.getState() );
	if ( Object.values( productsList ).length === 0 ) {
		await requestProductsList( { type: 'all', presist: true } )( store.dispatch );
	}

	const isMarketplaceProduct = isMarketplaceProductSelector( store.getState(), pluginSlug );

	let data = getWporgPluginSelector( store.getState(), pluginSlug );
	if ( isMarketplaceProduct ) {
		data = await prefetchPluginsData( queryClient, getFetchWPCOMPlugin( pluginSlug ) );
	} else if ( ! data ) {
		await store.dispatch( wporgFetchPluginData( pluginSlug, options.locale ) );
		data = getWporgPluginSelector( store.getState(), pluginSlug );
	}

	context.queryClient = queryClient;
	next();
}

export async function fetchPlugins( context, next ) {
	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getProps( context ),
	};

	const { queryClient } = context;

	await Promise.all( [
		prefetchPluginsData(
			queryClient,
			getFetchWPCOMPlugins( true, 'all', options.search, options.tag )
		),
		options.search
			? prefetchPluginsData( queryClient, getFetchWPORGInfinitePlugins( options ), true )
			: Promise.resolve(),
		prefetchPluginsData( queryClient, getFetchWPORGPlugins( { ...options, category: 'popular' } ) ),
		prefetchPluginsData( queryClient, getFetchWPCOMFeaturedPlugins() ),
	] );

	context.queryClient = queryClient;
	next();
}

export async function fetchCategoryPlugins( context, next ) {
	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getProps( context ),
	};
	const categories = getCategories();
	const categoryTags = categories[ options.category || '' ]?.tags || [ options.category ];
	options.tag = categoryTags.join( ',' );

	const { queryClient } = context;

	await Promise.all( [
		prefetchPluginsData(
			queryClient,
			getFetchWPCOMPlugins( true, 'all', options.search, options.tag )
		),
		options.search
			? prefetchPluginsData( queryClient, getFetchWPORGInfinitePlugins( options ), true )
			: Promise.resolve(),
		prefetchPluginsData( queryClient, getFetchWPORGInfinitePlugins( options ), true ),
	] );

	context.queryClient = queryClient;

	next();
}
