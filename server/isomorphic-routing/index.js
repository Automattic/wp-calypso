/**
 * External dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import pick from 'lodash/object/pick';

/**
 * Internal dependencies
 */
import config from 'config';
import sections from '../../client/sections';
import i18n from 'lib/mixins/i18n';
import LayoutLoggedOutDesign from 'layout/logged-out-design';
import { render } from 'render';
import { createReduxStore } from 'state';
import { setSection } from 'state/ui/actions';

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

function applyMiddlewares( context, mws ) {
	const liftedMws = mws.map( mw => next => mw( context, next ) );
	compose( ...liftedMws )();
}

function compose( ...fns ) {
	return fns.reduceRight( ( composed, f ) => (
		next => f( composed ) // eslint-disable-line no-unused-vars
	), () => {} );
}

export default function( expressApp, getDefaultContext ) {
	sections.get()
		.filter( section => section.routing === 'isomorphic' )
		.forEach( section => {
			section.require( section.module )( serverRouter );

			function serverRouter( route, ...middlewares ) {
				expressApp.get( route, combinedMiddlewares );

				function combinedMiddlewares( req ) {
					const context = getDefaultContext( req );
					getEnhancedContext( context );
					applyMiddlewares( context, ...[
						setUpRoute,
						...middlewares,
						serverRender
					] );
				}
			}

			function setUpRoute( context, next ) {
				i18n.initialize();
				context.store.dispatch( setSection( section.name, {
					hasSidebar: false,
					isFullScreen: true
				} ) ); // FIXME
				context.initialReduxState = pick( context.store.getState(), 'ui' );
				next();
			}

			function serverRender( context ) {
				if ( config.isEnabled( 'server-side-rendering' ) ) {
					Object.assign( context, render( (
						<ReduxProvider store={ context.store }>
							<LayoutLoggedOutDesign store={ context.store } primary={ context.primary } />
						</ReduxProvider>
					) ) ); // FIXME: tier (general props), Head
				}
				context.res.render( 'index.jade', context );
			}
		} );
};
