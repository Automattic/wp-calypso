import config from '@automattic/calypso-config';
import {
	getWPCOMFeaturedPluginsQueryParams,
	getWPCOMPluginsQueryParams,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { getWPORGPluginsQueryParams } from 'calypso/data/marketplace/use-wporg-plugin-query';
import wpcom from 'calypso/lib/wp';
import { receiveProductsList } from 'calypso/state/products-list/actions';

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
	const type = 'all';

	return queryClient
		.fetchQuery( [ 'products-list', type ], () => wpcom.req.get( '/products', { type } ) )
		.then( ( productsList ) => {
			return store.dispatch( receiveProductsList( productsList, type ) );
		} );
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
	} );
};

export async function fetchPlugins( context, next ) {
	const { queryClient, store } = context;

	if ( ! context.isServerSide ) {
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

export function skipIfLoggedIn( context, next ) {
	if ( context.isLoggedIn ) {
		return next( 'route' );
	}

	next();
}
