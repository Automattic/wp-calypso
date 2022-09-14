import {
	getWPCOMFeaturedPluginsQueryParams,
	getWPCOMPluginsQueryParams,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { getWPORGPluginsQueryParams } from 'calypso/data/marketplace/use-wporg-plugin-query';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';

function getProps( context ) {
	const props = {
		path: context.path,
		locale: context.lang,
		tag: '',
	};
	return props;
}

function prefetchPluginsData( queryClient, fetchParams, infinite ) {
	const queryType = infinite ? 'prefetchInfiniteQuery' : 'prefetchQuery';

	return queryClient[ queryType ]( ...fetchParams );
}

const prefetchPaidPlugins = ( queryClient, options ) =>
	prefetchPluginsData(
		queryClient,
		getWPCOMPluginsQueryParams( 'all', options.search, options.tag )
	);

const prefetchPopularPlugins = ( queryClient, options ) =>
	prefetchPluginsData(
		queryClient,
		getWPORGPluginsQueryParams( { ...options, category: 'popular' } )
	);

const prefetchFeaturedPlugins = ( queryClient ) =>
	prefetchPluginsData( queryClient, getWPCOMFeaturedPluginsQueryParams() );

const prefetchProductList = ( store ) => {
	const productsList = getProductsList( store.getState() );
	if ( Object.values( productsList ).length === 0 ) {
		return requestProductsList( { type: 'all' } )( store.dispatch );
	}
};

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
		prefetchPaidPlugins( queryClient, options ),
		prefetchPopularPlugins( queryClient, options ),
		prefetchFeaturedPlugins( queryClient, options ),
	] );

	next();
}

export function skipIfLoggedIn( context, next ) {
	if ( context.isLoggedIn ) {
		return next( 'route' );
	}

	next();
}
