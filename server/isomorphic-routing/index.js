/**
 * External dependencies
 */
import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import pick from 'lodash/object/pick';
import isEmpty from 'lodash/lang/isEmpty';

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

function getEnhancedContext( context, req ) {
	return Object.assign( {}, context, {
		path: req.path,
		params: Object.assign( {}, context.params, req.params ),
		query: {}
	} );
}

export default function( expressApp, getDefaultContext ) {
	sections.get()
		.filter( section => section.routing === 'isomorphic' )
		.forEach( section => {
			// Since each middleware can mutate context, we need to set it up here
			// and preserve it over iterations. If this turns out to be too complex,
			// we might want to resort to the inverse approach, i.e. using
			// https://github.com/kethinov/page.js-express-mapper.js on the client side.
			let context = {};
			let store = createReduxStore();

			// Maybe inline those functions below?

			// Top-level routes
			section.paths.forEach( path => expressApp.get( path, setUpRoute ) );
			// Individual routes from chunk
			sections.require( section.module )( serverRouter ); // possibly also pass context.isLoggedIn/isServerSide?
			// Render!
			section.paths.forEach( path => expressApp.get( path, serverRender ) );

			function setUpRoute( req, res, next ) {
				i18n.initialize();
				context.isServerSide = true;
				context.isLoggedIn = req.cookies.wordpress_logged_in;

				store.dispatch( setSection( section.name, {
					hasSidebar: false,
					isFullScreen: true
				} ) ); // FIXME
				context.initialReduxState = pick( store.getState(), 'ui' );
				next();
			}

			function liftMiddleware( pageMiddleware ) {
				return ( req, res, next ) => {
					if ( isEmpty( context ) ) {
						context = getDefaultContext( req );
					}
					getEnhancedContext( context, req ); // Update path etc.
					pageMiddleware( context, next );
				}
			}

			function serverRouter( route, ...mws ) {
				expressApp.get( route, mws.map( liftMiddleware ) );
			}

			function serverRender( req, res ) {
				if ( config.isEnabled( 'server-side-rendering' ) ) {
					Object.assign( context, render( (
						<ReduxProvider store={ store }>
							<LayoutLoggedOutDesign store={ store } primary={ context.primary } />
						</ReduxProvider>
					) ) ); // FIXME: tier (general props), Head
				}
				res.render( 'index.jade', context );
			}
		} );
};
