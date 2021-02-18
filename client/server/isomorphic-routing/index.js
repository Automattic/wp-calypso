/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import { serverRender, setShouldServerSideRender } from 'calypso/server/render';
import { setSectionMiddleware } from 'calypso/controller';
import { setRoute } from 'calypso/state/route/actions';

export function serverRouter( expressApp, setUpRoute, section ) {
	return function ( route, ...middlewares ) {
		expressApp.get(
			route,
			setUpRoute,
			combineMiddlewares(
				setSectionMiddleware( section ),
				setRouteMiddleware,
				setShouldServerSideRender,
				...middlewares
			),
			// Regular serverRender when there are no errors.
			serverRender,

			// Capture the error. This assumes that any of the previous middlewares
			// have changed req.context to include info about the error, and serverRender
			// will render it.
			( err, req, res, next ) => {
				req.error = err;
				res.status( err.status || 404 );
				if ( err.status >= 500 ) {
					req.logger.error( err );
				} else {
					req.logger.warn( err );
				}
				serverRender( req, res, next );
				// Keep propagating the error to ensure regular middleware doesn't get executed.
				// In particular, without this we'll try to render a 404 page.
				next( err );
			}
		);
	};
}

function setRouteMiddleware( context, next ) {
	context.store.dispatch( setRoute( context.pathname, context.query ) );

	next();
}

function combineMiddlewares( ...middlewares ) {
	return function ( req, res, expressNext ) {
		req.context = getEnhancedContext( req, res );
		applyMiddlewares(
			req.context,
			...middlewares,

			// These two middlewares transfer the control back to Express. We need two, one
			// to end the chain of middlewares when there is no error, and another one
			// for when there is an error.
			// eslint-disable-next-line no-unused-vars
			( context, next ) => expressNext(),
			// eslint-disable-next-line no-unused-vars
			( err, context, next ) => expressNext( err )
		);
	};
}

// TODO: Maybe merge into getDefaultContext().
function getEnhancedContext( req, res ) {
	return Object.assign( {}, req.context, {
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

function applyMiddlewares( context, ...middlewares ) {
	// This method will run all middlewares chained. Every time a middlware calls
	// `next`, it will pass the control to the next middleware and so on. But if
	// at any point a middleware calls `next(error)`, only middlewares that declare
	// 3 arguments (aka error handlers) will be called from that point.
	const liftedMiddlewares = middlewares.map( ( middleware ) => ( next, err ) => {
		try {
			if ( ! err && middleware.length !== 3 ) {
				// No errors so far, call next middleware
				return middleware( context, next );
			}
			if ( err && middleware.length === 3 ) {
				// There is an error and this middleware can handle errors
				return middleware( err, context, next );
			}
			// At this point we are in either of these scenarios:
			// * There is an error but this middlware is not an error handler
			// * There is not an error but this middleware is an error handler
			// In both cases this middleware shouldn't run, so we just skip to the next one.
			next( err );
		} catch ( error ) {
			// The middleware throw an error, capture it and pass it to the next
			// middleware in the chain.
			next( error );
		}
	} );

	compose( ...liftedMiddlewares )();
}

function compose( ...functions ) {
	return functions.reduceRight(
		( composed, f ) => ( err ) => f( composed, err ),
		() => {}
	);
}

export function getNormalizedPath( pathname, query ) {
	if ( isEmpty( query ) ) {
		return pathname;
	}

	return pathname + '?' + stringify( query, { sort: ( a, b ) => a.localeCompare( b ) } );
}
