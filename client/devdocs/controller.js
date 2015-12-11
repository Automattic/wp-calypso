/**
 * External dependencies
 */
var ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	qs = require( 'qs' ),
	debounce = require( 'lodash/function/debounce' ),
	page = require( 'page' ),
	EmptyContent = require( 'components/empty-content' );

/**
 * Internal dependencies
 */
var DocsComponent = require( './main' ),
	SingleDocComponent = require( './doc' ),
	DesignAssetsComponent = require( './design' ),
	Typography = require( './design/typography' ),
	DevWelcome = require( './welcome' ),
	Sidebar = require( './sidebar' ),
	FormStateExamplesComponent = require( './form-state-examples' );

var devdocs = {

	/**
	 * Documentation is rendered on #primary and doesn't expect a sidebar to exist
	 * so #secondary needs to be cleaned up
	 */
	sidebar: function( context, next ) {
		ReactDom.render(
			React.createElement( Sidebar, {} ),
			document.getElementById( 'secondary' )
		);

		next();
	},

	/**
	 * Controller for page listing multiple developer docs
	 */
	devdocs: function( context ) {
		function onSearchChange( searchTerm ) {
			var query = qs.parse( context.querystring );
			if ( searchTerm ) {
				query.term = searchTerm;
			} else {
				delete query.term;
			}

			page.replace( context.pathname + '?' + qs.stringify( query ).replace( /%20/g, '+' ),
				context.state,
				false,
				false );
		}

		context.layout.setState( {
			section: 'devdocs',
			noSidebar: false
		} );

		ReactDom.render(
			React.createElement( DocsComponent, {
				term: context.query.term,
				// we debounce with wait time of 0, so that the search doesn’t happen
				// in the same tick as the keyUp event and possibly cause typing lag
				onSearchChange: debounce( onSearchChange, 0 )
			} ),
			document.getElementById( 'primary' )
		);
	},

	/**
	 * Controller for single developer document
	 */
	singleDoc: function( context ) {
		context.layout.setState( {
			section: 'devdocs',
			noSidebar: false
		} );

		ReactDom.render(
			React.createElement( SingleDocComponent, {
				path: context.params.path,
				term: context.query.term,
				sectionId: Object.keys( context.hash )[0]
			} ),
			document.getElementById( 'primary' )
		);
	},

	// UI components
	design: function( context ) {
		context.layout.setState( {
			section: 'devdocs',
			noSidebar: false
		} );

		ReactDom.render(
			React.createElement( DesignAssetsComponent, {
				component: context.params.component
			} ),
			document.getElementById( 'primary' )
		);
	},

	typography: function( context ) {
		context.layout.setState( {
			section: 'devdocs',
			noSidebar: false
		} );

		ReactDom.render(
			React.createElement( Typography, {
				component: context.params.component
			} ),
			document.getElementById( 'primary' )
		);
	},

	formStateExamples: function( context ) {
		ReactDom.render(
			React.createElement( FormStateExamplesComponent, {
				component: context.params.component
			} ),
			document.getElementById( 'primary' )
		);
	},

	pleaseLogIn: function( context ) {
		context.layout.setState( {
			section: 'devdocs-start',
			noSidebar: true
		} );

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

		ReactDom.render(
			React.createElement( EmptyContent, {
				title: 'Log In to start hacking',
				line: 'Required to access the WordPress.com API',
				action: 'Log In to WordPress.com',
				actionURL: 'https://wordpress.com/wp-login.php?redirect_to=http%3A%2F%2Fcalypso.localhost%3A3000/devdocs/welcome',
				secondaryAction: 'Register',
				secondaryActionURL: '/start/developer',
				illustration: '/calypso/images/drake/drake-nosites.svg'
			} ),
			document.getElementById( 'primary' )
		);
	},

	// Welcome screen
	welcome: function( context ) {
		context.layout.setState( {
			section: 'devdocs',
			noSidebar: false
		} );

		ReactDom.render(
			React.createElement( DevWelcome, {} ),
			document.getElementById( 'primary' )
		);
	}
};

module.exports = devdocs;
