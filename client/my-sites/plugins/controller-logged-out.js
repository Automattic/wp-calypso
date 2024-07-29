import config from '@automattic/calypso-config';
import { getESPluginsInfiniteQueryParams } from 'calypso/data/marketplace/use-es-query';
import {
	getWPCOMFeaturedPluginsQueryParams,
	getWPCOMPluginsQueryParams,
	getWPCOMPluginQueryParams,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { getSiteFragment } from 'calypso/lib/route';
import wpcom from 'calypso/lib/wp';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin as getWporgPluginSelector } from 'calypso/state/plugins/wporg/selectors';
import { receiveProductsList } from 'calypso/state/products-list/actions';
import { isMarketplaceProduct as isMarketplaceProductSelector } from 'calypso/state/products-list/selectors';
import { getCategories } from './categories/use-categories';
import { getCategoryForPluginsBrowser } from './controller';

const PREFETCH_TIMEOUT = 2000;
const PREFETCH_TIMEOUT_BOTS = 10000;
const PREFETCH_TIMEOUT_ERROR = 'plugins prefetch timeout';

function getQueryOptions( { path, lang } ) {
	const props = {
		path,
		locale: lang,
		tag: '',
	};
	return props;
}

function prefetchPluginsData( queryClient, fetchParams, infinite ) {
	const queryType = infinite ? 'prefetchInfiniteQuery' : 'prefetchQuery';

	return queryClient[ queryType ]( fetchParams );
}

const prefetchPaidPlugins = ( queryClient, options ) =>
	prefetchPluginsData(
		queryClient,
		getWPCOMPluginsQueryParams( 'all', options.search, options.tag )
	);

const prefetchPopularPlugins = ( queryClient, options ) => {
	const infinite = true;
	return prefetchPluginsData(
		queryClient,
		getESPluginsInfiniteQueryParams( { ...options, category: 'popular', infinite }, infinite ),
		true
	);
};

const prefetchCategoryPlugins = ( queryClient, options ) => {
	const infinite = true;
	return prefetchPluginsData(
		queryClient,
		getESPluginsInfiniteQueryParams( { ...options, infinite }, infinite ),
		true
	);
};

const prefetchFeaturedPlugins = ( queryClient ) =>
	prefetchPluginsData( queryClient, getWPCOMFeaturedPluginsQueryParams() );

const prefetchProductList = ( queryClient, store ) => {
	const type = 'all';

	return queryClient
		.fetchQuery( {
			queryKey: [ 'products-list', type ],
			queryFn: () => wpcom.req.get( '/products', { type } ),
		} )
		.then( ( productsList ) => {
			return store.dispatch( receiveProductsList( productsList, type ) );
		} );
};

const prefetchPlugin = async ( queryClient, store, { locale, pluginSlug } ) => {
	const isMarketplaceProduct = isMarketplaceProductSelector( store.getState(), pluginSlug );

	let data = getWporgPluginSelector( store.getState(), pluginSlug );
	if ( isMarketplaceProduct ) {
		data = await prefetchPluginsData( queryClient, getWPCOMPluginQueryParams( pluginSlug ) );
	} else if ( ! data ) {
		await store.dispatch( wporgFetchPluginData( pluginSlug, locale ) );
		data = getWporgPluginSelector( store.getState(), pluginSlug );
		if ( data?.error ) {
			throw new Error( data.error );
		}
	}

	return data;
};

const prefetchTimebox = ( prefetchPromises, context ) => {
	const racingPromises = [ Promise.all( prefetchPromises ) ];
	const isBot = context.res?.req?.useragent?.isBot;

	if ( config.isEnabled( 'ssr/prefetch-timebox' ) ) {
		const timeboxPromise = new Promise( ( _, reject ) =>
			setTimeout(
				reject,
				isBot ? PREFETCH_TIMEOUT_BOTS : PREFETCH_TIMEOUT,
				new Error( PREFETCH_TIMEOUT_ERROR )
			)
		);

		racingPromises.push( timeboxPromise );
	}

	return Promise.race( racingPromises ).catch( ( err ) => {
		if ( isBot ) {
			context.res.status( 504 );
		}
		context.serverSideRender = false;

		context.res.req.logger.error( {
			feature: 'calypso_ssr',
			message: err?.message,
		} );

		return err;
	} );
};

export async function fetchPlugins( context, next ) {
	const { queryClient, store, isServerSide, cachedMarkup } = context;

	if ( ! isServerSide || cachedMarkup ) {
		return next();
	}

	const options = {
		...getQueryOptions( context ),
	};

	await prefetchTimebox(
		[
			prefetchProductList( queryClient, store ),
			prefetchPaidPlugins( queryClient, options ),
			prefetchPopularPlugins( queryClient, options ),
			prefetchFeaturedPlugins( queryClient, options ),
		],
		context
	);

	next();
}

export async function fetchCategoryPlugins( context, next ) {
	const { queryClient, store } = context;

	if ( ! context.isServerSide ) {
		return next();
	}

	const categories = getCategories();
	const category = getCategoryForPluginsBrowser( context );

	const categoryTags = categories[ category || '' ]?.tags || [ category ];
	const tag = categoryTags.join( ',' );

	const options = {
		...getQueryOptions( context ),
		category,
		tag,
	};

	await prefetchTimebox(
		[
			prefetchProductList( queryClient, store ),
			prefetchPaidPlugins( queryClient, options ),
			prefetchCategoryPlugins( queryClient, options ),
		],
		context
	);

	next();
}

export async function fetchPlugin( context, next ) {
	const { queryClient, store } = context;

	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getQueryOptions( context ),
		pluginSlug: context.params?.plugin,
	};

	const dataOrError = await prefetchTimebox(
		[
			// We need to have the product list before prefetchPlugin so it can determine where to fetch from.
			prefetchProductList( queryClient, store ).then( () =>
				prefetchPlugin( queryClient, store, options )
			),
		],
		context
	);

	if ( dataOrError instanceof Error ) {
		if ( dataOrError.message !== PREFETCH_TIMEOUT_ERROR ) {
			return next( 'route' );
		}
	}

	next();
}

export function validatePlugin( { path, params: { plugin } }, next ) {
	const siteFragment = getSiteFragment( path );

	if (
		plugin === 'scheduled-updates' ||
		siteFragment ||
		Number.isInteger( parseInt( plugin, 10 ) )
	) {
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
