/**
 * Internal dependencies
 */
import { serverRender } from 'render';
import { setSection as setSectionMiddlewareFactory } from '../../client/controller';

export function serverRouter( expressApp, setUpRoute, section ) {
	return function( route, ...middlewares ) {
		if ( middlewares.length === 0 && typeof route === 'function' && route.length === 3 ) {
			// No route def -- the route arg is really an error-handling middleware
			expressApp.use( ( err, req, res, next ) => {
				route( err, req.context, next );
			} );
			expressApp.use( ( err, req, res, next ) => { // eslint-disable-line no-unused-vars
				serverRender( req, res.status( err.status ) );
			} );
		} else {
			expressApp.get(
				route,
				setUpRoute,
				combineMiddlewares(
					setSectionMiddlewareFactory( section ),
					...middlewares
				),
				serverRender
			);
		}
	};
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
		path: req.url,
		pathname: req.path,
		params: req.params,
		query: req.query,
		res
	} );
}

function applyMiddlewares( context, expressNext, ...middlewares ) {
	const liftedMiddlewares = middlewares.map( middleware => next => middleware( context, ( err ) => {
		if ( err ) {
			expressNext( err ); // Call express' next( err ) for error handling (and bail early from this route)
		} else {
			next();
		}
	} ) );
	compose( ...liftedMiddlewares )();
}
function compose( ...functions ) {
	return functions.reduceRight( ( composed, f ) => (
		() => f( composed )
	), () => {} );
}
