/** @format */
/**
 * External dependencies
 */
import deterministicStringify from 'json-stable-stringify';
import { isEmpty, pick } from 'lodash';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { serverRender } from 'render';
import { setSection as setSectionMiddlewareFactory } from '../../client/controller';
import { setRoute as setRouteAction } from 'state/ui/actions';

export function serverRouter( expressApp, setUpRoute, section ) {
	return function( route, ...middlewares ) {
		if ( middlewares.length === 0 && typeof route === 'function' && route.length === 3 ) {
			// No route def -- the route arg is really an error-handling middleware
			// `page( someMw )` would be a shorthand for `page( '*', someMw )`, even tho the same isn't true
			// for Express, we want things to be isomorphic, so that should be handled by the `else` branch.
			// OTOH, if `someMw` takes 3 args `( err, context, next )` instead of the usual 2 `( context, next )`,
			// it's an error-handling middleware and needs to be handled by this branch.
			expressApp.use(
				( err, req, res, next ) => {
					route( err, req.context, next );
				},
				( err, req, res, next ) => {
					req.error = err;
					res.status( err.status || 404 );
					serverRender( req, res, next );
				}
			);
		} else {
			expressApp.get(
				route,
				setUpRoute,
				enhanceContext( section ),
				combineMiddlewares(
					setSectionMiddlewareFactory( section ),
					setRouteMiddleware,
					...middlewares
				),
				serverRender
			);
		}
	};
}

function setRouteMiddleware( context, next ) {
	context.store.dispatch( setRouteAction( context.pathname, context.query ) );

	next();
}

function combineMiddlewares( ...middlewares ) {
	return function( req, res, next ) {
		applyMiddlewares( req.context, next, ...middlewares, () => {
			next();
		} );
	};
}

function enhanceContext( section ) {
	return function( req, res, next ) {
		req.context = getEnhancedContext( req, res, section );
		next();
	};
}

export function getEnhancedContext( req, res, section ) {
	// Do not expose "non-cacheable" query parameters to the SSR engine otherwise sensitive
	// information could leak into the cache
	const cacheQueryKeys = section.cacheQueryKeys || [];
	const query = pick( req.query, cacheQueryKeys );
	const querystring = stringify( query );
	const path = req.path + ( querystring ? '?' + querystring : '' );

	return Object.assign( {}, req.context, {
		isLoggedIn: req.cookies.wordpress_logged_in,
		isServerSide: true,
		originalUrl: path,
		path: path,
		pathname: req.path,
		params: req.params,
		query: query,
		protocol: req.protocol,
		host: req.headers.host,
		redirect: res.redirect.bind( res ),
		res,
	} );
}

function applyMiddlewares( context, expressNext, ...middlewares ) {
	const liftedMiddlewares = middlewares.map( middleware => next =>
		middleware( context, err => {
			if ( err ) {
				expressNext( err ); // Call express' next( err ) for error handling (and bail early from this route)
			} else {
				next();
			}
		} )
	 );
	compose( ...liftedMiddlewares )();
}

function compose( ...functions ) {
	return functions.reduceRight( ( composed, f ) => () => f( composed ), () => {} );
}

/**
 * Get a key used to cache SSR result for the request, or null to disable the cache.
 *
 * @param  {Object}        context                The request context
 * @param  {string}        context.pathname       Request path
 * @param  {Object}        context.query          Query parameters
 * @return {?string}                              The cache key or null to disable cache
 */
export function getCacheKey( { pathname, query } ) {
	if ( ! isEmpty( query ) ) {
		return pathname + '?' + deterministicStringify( query );
	}

	return pathname;
}
