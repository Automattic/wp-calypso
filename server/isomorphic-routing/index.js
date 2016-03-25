/**
 * Internal dependencies
 */
import i18n from 'lib/mixins/i18n';
import sections from '../../client/sections';
import { serverRender } from 'render';
import { createReduxStore } from 'state';
import { setSection as setSectionMiddlewareFactory } from '../../client/controller';

export default function( expressApp, setUpRoute ) {
	sections.get()
		.filter( section => section.isomorphic )
		.forEach( section => {
			sections.require( section.module )( serverRouter( expressApp, setUpRoute, section ) );
		} );
}

function serverRouter( expressApp, setUpRoute, section ) {
	return function( route, ...middlewares ) {
		expressApp.get( route, setUpRoute, combinedMiddlewares( middlewares, section ), serverRender );
	}
}

function combinedMiddlewares( middlewares, section ) {
	return function( req, res, next ) {
		req.context = getEnhancedContext( req );
		applyMiddlewares( req.context, ...[
			setUpI18n,
			setSectionMiddlewareFactory( section ),
			...middlewares
		] );
		next();
	}
}

// TODO: Maybe merge into getDefaultContext().
function getEnhancedContext( req ) {
	return Object.assign( {}, req.context, {
		isLoggedIn: req.cookies.wordpress_logged_in,
		isServerSide: true,
		path: req.path,
		params: req.params,
		query: {}, // Why?
		store: createReduxStore()
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

function setUpI18n( context, next ) {
	i18n.initialize();
	next();
}
