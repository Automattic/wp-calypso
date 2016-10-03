/**
 * Internal dependencies
 */
import { serverRender } from 'render';
import { createReduxStore } from 'state';
import { setSection as setSectionMiddlewareFactory } from '../../client/controller';

export function serverRouter( expressApp, setUpRoute, section ) {
	return function( route, ...middlewares ) {
		expressApp.get(
			route,
			setUpRoute,
			combineMiddlewares(
				setSectionMiddlewareFactory( section ),
				...middlewares
			),
			serverRender
		);
	};
}

function combineMiddlewares( ...middlewares ) {
	return function( req, res, next ) {
		req.context = getEnhancedContext( req );
		applyMiddlewares( req.context, ...middlewares, () => {
			next();
		} );
	};
}

// TODO: Maybe merge into getDefaultContext().
function getEnhancedContext( req ) {
	return Object.assign( {}, req.context, {
		isLoggedIn: req.cookies.wordpress_logged_in,
		isServerSide: true,
		path: req.url,
		pathname: req.path,
		params: req.params,
		query: req.query,
		store: createReduxStore()
	} );
}

function applyMiddlewares( context, ...middlewares ) {
	const liftedMiddlewares = middlewares.map( middleware => next => middleware( context, next ) );
	compose( ...liftedMiddlewares )();
}

function compose( ...functions ) {
	return functions.reduceRight( ( composed, f ) => (
		next => f( composed ) // eslint-disable-line no-unused-vars
	), () => {} );
}
