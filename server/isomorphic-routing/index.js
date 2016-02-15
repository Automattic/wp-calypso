/**
 * External dependencies
 */
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import { serverRender } from 'render';
import { createReduxStore } from 'state';

export function serverRouter( expressApp, mapExpressToPageContext ) {
	return function( route, ...middlewares ) {
		expressApp.get( route, combinedMiddlewares( mapExpressToPageContext, middlewares ) );
	}
}

function combinedMiddlewares( mapExpressToPageContext, middlewares ) {
	return function( req, res ) {
		let context = mapExpressToPageContext( req );
		context = getEnhancedContext( context, req, res );
		applyMiddlewares( context, ...[
			setUpRoute,
			...middlewares,
			serverRender
		] );
	}
}

function getEnhancedContext( context, req, res ) {
	return Object.assign( {}, context, {
		isLoggedIn: req.cookies.wordpress_logged_in,
		isServerSide: true,
		path: req.path,
		params: Object.assign( {}, context.params, req.params ),
		query: {},
		store: createReduxStore(),
		res,
	} );
}

function applyMiddlewares( context, ...middlewares ) {
	const liftedmiddlewares = middlewares.map( middleware => next => middleware( context, next ) );
	compose( ...liftedmiddlewares )();
}

function compose( ...functions ) {
	return functions.reduceRight( ( composed, f ) => (
		next => f( composed ) // eslint-disable-line no-unused-vars
	), () => {} );
}

function setUpRoute( context, next ) {
	i18n.initialize();
	context.initialReduxState = pick( context.store.getState(), 'ui' );
	next();
}
