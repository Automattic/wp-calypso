/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import sections from '../../client/sections';
import { serverRender } from 'render';
import { createReduxStore } from 'state';
import { setSection as setSectionMiddlewareFactory } from '../../client/controller';

export default function( expressApp, getDefaultContext ) {
	sections.get()
		.filter( section => section.isomorphic )
		.forEach( section => {
			sections.require( section.module )( serverRouter( expressApp, getDefaultContext, section ) );
		} );
}

function serverRouter( expressApp, mapExpressToPageContext, section ) {
	return function( route, ...middlewares ) {
		expressApp.get( route, combinedMiddlewares( mapExpressToPageContext, middlewares, section ) );
	}
}

function combinedMiddlewares( mapExpressToPageContext, middlewares, section ) {
	return function( req, res ) {
		let context = mapExpressToPageContext( req );
		context = getEnhancedContext( context, req, res );
		applyMiddlewares( context, ...[
			setUpRoute,
			setSectionMiddlewareFactory( section ),
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
		url: req.url
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
	next();
}
