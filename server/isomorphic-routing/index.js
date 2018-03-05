/** @format */
/**
 * External dependencies
 */

import { isEmpty, pick } from 'lodash';
import qs from 'qs';

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
		req.context = getEnhancedContext( req, res );
		applyMiddlewares( req.context, next, ...middlewares, () => {
			next();
		} );
	};
}

// TODO: Maybe merge into getDefaultContext().
function getEnhancedContext( req, res ) {
	return Object.assign( {}, req.context, {
		isLoggedIn: req.cookies.wordpress_logged_in,
		isServerSide: true,
		originalUrl: req.originalUrl,
		path: req.url,
		pathname: req.path,
		params: req.params,
		query: req.query,
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

export function getCacheKey( context ) {
	if ( isEmpty( context.query ) || isEmpty( context.cacheQueryKeys ) ) {
		return context.pathname;
	}

	const cachedQueryParams = pick( context.query, context.cacheQueryKeys );
	return (
		context.pathname +
		'?' +
		qs.stringify( cachedQueryParams, { sort: ( a, b ) => a.localCompare( b ) } )
	);
}
