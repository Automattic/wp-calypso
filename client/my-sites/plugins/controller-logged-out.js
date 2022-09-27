import {
	getWPCOMFeaturedPluginsQueryParams,
	getWPCOMPluginsQueryParams,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { getWPORGPluginsQueryParams } from 'calypso/data/marketplace/use-wporg-plugin-query';
import wpcom from 'calypso/lib/wp';
import { receiveProductsList } from 'calypso/state/products-list/actions';

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

const prefetchProductList = ( queryClient, store ) => {
	const query = { type: 'all' };

	return queryClient
		.fetchQuery( 'products-list', () => wpcom.req.get( '/products', query ) )
		.then(
			( productsList ) => {
				return store.dispatch( receiveProductsList( productsList, query.type ) );
			},
			() => {}
		);
};

export async function fetchPlugins( context, next ) {
	const { queryClient, store } = context;

	if ( ! context.isServerSide ) {
		return next();
	}

	const options = {
		...getQueryOptions( context ),
	};

	await Promise.all( [
		prefetchProductList( queryClient, store ),
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
