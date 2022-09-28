import config from '@automattic/calypso-config';
import {
	getWPCOMFeaturedPluginsQueryParams,
	getWPCOMPluginsQueryParams,
} from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { getWPORGPluginsQueryParams } from 'calypso/data/marketplace/use-wporg-plugin-query';
import { logToLogstash } from 'calypso/lib/logstash';
import { requestProductsList } from 'calypso/state/products-list/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';

const PREFETCH_TIMEOUT = 500;
const PREFECTH_TIMEOUT_ERROR = 'plugin-prefetch-timeout';

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

const prefetchProductList = ( store ) => {
	const productsList = getProductsList( store.getState() );
	if ( Object.values( productsList ).length === 0 ) {
		return requestProductsList( { type: 'all' } )( store.dispatch );
	}
};

const prefetchTimebox = ( prefetchPromises, context, key, timeout = PREFETCH_TIMEOUT ) => {
	let prefetcfhFulfilled = false;
	return Promise.race( [
		Promise.all( prefetchPromises ).then( () => ( prefetcfhFulfilled = true ) ),
		new Promise( ( _, reject ) =>
			setTimeout( () => ! prefetcfhFulfilled && reject( PREFECTH_TIMEOUT_ERROR ), timeout )
		),
	] ).catch( ( err ) => {
		if ( err === PREFECTH_TIMEOUT_ERROR ) {
			if ( context.res?.req?.useragent?.isBot ) {
				context.res.status( 504 );
			}
			context.skipMarkupCache = true;

			if ( config.isEnabled( 'ssr/log-prefecth-timeout' ) ) {
				logToLogstash( {
					feature: 'calypso_ssr',
					message: 'plugins prefetch timeout',
					extra: {
						key,
						'user-agent': context.res.req.useragent.source,
						path: context.path,
					},
				} );
			}
		}
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
		context,
		'fetchPlugins'
	);

	next();
}

export function skipIfLoggedIn( context, next ) {
	if ( context.isLoggedIn ) {
		return next( 'route' );
	}

	next();
}
