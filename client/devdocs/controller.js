/**
 * External dependencies
 */
var React = require( 'react' ),
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
	Sidebar = require( './sidebar' ),
	FormStateExamplesComponent = require( './form-state-examples' );

var devdocs = {

	/**
	 * Documentation is rendered on #primary and doesn't expect a sidebar to exist
	 * so #secondary needs to be cleaned up
	 */
	sidebar: function( context, next ) {
		React.render(
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

		context.layout.setState( { section: 'devdocs' } );

		React.render(
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
		context.layout.setState( { section: 'devdocs' } );

		React.render(
			React.createElement( SingleDocComponent, {
				path: context.params.path,
				term: context.query.term,
				sectionId: context.hash
			} ),
			document.getElementById( 'primary' )
		);
	},

	/**
	 * Design specs and docs for Calypso
	 */
	design: function( context ) {
		context.layout.setState( { section: 'devdocs' } );

		React.render(
			React.createElement( DesignAssetsComponent, {
				component: context.params.component
			} ),
			document.getElementById( 'primary' )
		);
	},

	formStateExamples: function( context ) {
		React.render(
			React.createElement( FormStateExamplesComponent, {
				component: context.params.component
			} ),
			document.getElementById( 'primary' )
		);
	},

	pleaseLogIn: function( context ) {
		context.layout.setState( { section: 'devdocs-start' } );

		React.unmountComponentAtNode( document.getElementById( 'secondary' ) );

		React.render(
			React.createElement( EmptyContent, {
				title: 'Log In to start hacking',
				line: 'Required to access the WordPress.com API',
				action: 'Log In to WordPress.com',
				actionURL: 'https://wordpress.com/login',
				secondaryAction: 'Register',
				secondaryActionURL: 'https://wordpress.com/start',
				illustration: '/calypso/images/drake/drake-nosites.svg'
			} ),
			document.getElementById( 'primary' )
		);
	}
};

module.exports = devdocs;
