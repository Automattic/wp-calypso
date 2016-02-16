/**
 * External dependecies
 */
var React = require( 'react' ),
	ReduxProvider = require( 'react-redux' ).Provider,
	pick = require( 'lodash/object/pick' ),
	isEmpty = require( 'lodash/lang/isEmpty' );

/**
 * Internal dependecies
 */
var config = require( 'config' ),
	sections = require( '../../client/sections' ),
	LayoutLoggedOutDesign = require( 'layout/logged-out-design' ),
	render = require( 'render' ).render,
	createReduxStore = require( 'state' ).createReduxStore,
	setSection = require( 'state/ui/actions' ).setSection;

function getEnhancedContext( context, req ) {
	return Object.assign( {}, context, {
		path: req.path,
		params: Object.assign( {}, context.params, req.params ),
		query: {}
	} );
}

module.exports = function( expressApp, getDefaultContext ) {
	sections.get()
		.filter( function( section ) {
			return section.routing === 'isomorphic';
		} )
		.forEach( function( section ) {
			// Since each middleware can mutate context, we need to set it up here
			// and preserve it over iterations. If this turns out to be too complex,
			// we might want to resort to the inverse approach, i.e. using
			// https://github.com/kethinov/page.js-express-mapper.js on the client side.
			let context = {};
			let store = createReduxStore();

			function setUpRoute( req, res, next ) {
				context.isServerSide = true;
				context.isLoggedIn = req.cookies.wordpress_logged_in;

				store.dispatch( setSection( section.name, { hasSidebar: false, isFullScreen: true } ) ); // FIXME
				context.initialReduxState = pick( store.getState(), 'ui' );
				next();
			};

			function liftMiddleware( pageMiddleware ) {
				return function( req, res, next ) {
					if ( isEmpty( context ) ) {
						context = getDefaultContext( req );
					}
					getEnhancedContext( context, req ); // Update path etc.
					pageMiddleware( context, next );
				}
			};

			function serverRouter( route, ...mws ) {
				expressApp.get( route, mws.map( liftMiddleware ) );
			};

			function serverRender( req, res ) {
				if ( config.isEnabled( 'server-side-rendering' ) ) {
					Object.assign( context, render( (
						<ReduxProvider store={ store }>
							<LayoutLoggedOutDesign store={ store } primary={ context.primary } />
						</ReduxProvider>
					) ) ); // FIXME: tier (general props), Head
				}
				res.render( 'index.jade', context );
			};

			// Maybe inline those functions below?

			// Top-level routes
			section.paths.forEach( function( path ) {
				expressApp.get( path, setUpRoute );
			} );
			// Individual routes from chunk
			sections.require( section.module )( serverRouter ); // possibly also pass context.isLoggedIn/isServerSide?
			// Render!
			section.paths.forEach( function( path ) {
				expressApp.get( path, serverRender );
			} );
		} );
};
