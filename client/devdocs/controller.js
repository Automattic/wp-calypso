/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import qs from 'qs';
import debounce from 'lodash/debounce';
import page from 'page';
import { Provider as ReduxProvider } from 'react-redux';
import url from 'url';
import GraphProvider from 'lib/graph/GraphProvider';
import createGraph from 'lib/graph';
import GraphiQL from 'lib/graph/GraphiQL';

/**
 * Internal dependencies
 */
import DocsComponent from './main';
import SingleDocComponent from './doc';
import DesignAssetsComponent from './design';
import Blocks from './design/blocks';
import Typography from './design/typography';
import DevWelcome from './welcome';
import Sidebar from './sidebar';
import FormStateExamplesComponent from './form-state-examples';
import EmptyContent from 'components/empty-content';

const devdocs = {

	/*
	 * Documentation is rendered on #primary and doesn't expect a sidebar to exist
	 * so #secondary needs to be cleaned up
	 */
	sidebar: function( context, next ) {
		ReactDom.render(
			React.createElement( Sidebar, {
				path: context.path,
			} ),
			document.getElementById( 'secondary' )
		);

		next();
	},

	/*
	 * Controller for page listing multiple developer docs
	 */
	devdocs: function( context ) {
		function onSearchChange( searchTerm ) {
			let query = context.query,
				url = context.pathname;

			if ( searchTerm ) {
				query.term = searchTerm;
			} else {
				delete query.term;
			}

			const queryString = qs.stringify( query ).replace( /%20/g, '+' ).trim();

			if ( queryString ) {
				url += '?' + queryString;
			}

			page.replace( url,
				context.state,
				false,
				false );
		}

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

	/*
	 * Controller for single developer document
	 */
	singleDoc: function( context ) {
		ReactDom.render(
			React.createElement( SingleDocComponent, {
				path: context.params.path,
				term: context.query.term,
				sectionId: Object.keys( context.hash )[ 0 ]
			} ),
			document.getElementById( 'primary' )
		);
	},

	// UI components
	design: function( context ) {
		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( DesignAssetsComponent, {
					component: context.params.component
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	// App Blocks
	blocks: function( context ) {
		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( Blocks, {
					component: context.params.component
				} )
			),
			document.getElementById( 'primary' )
		);
	},

	typography: function( context ) {
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

	graph: function( context ) {
		const graph = createGraph( context.store );
		ReactDom.render(
			React.createElement( GraphProvider, { graph },
				React.createElement( GraphiQL )
			),
			document.getElementById( 'primary' )
		);
	},

	pleaseLogIn: function( context ) { // eslint-disable-line no-unused-vars
		const currentUrl = url.parse( location.href );
		const redirectUrl = currentUrl.protocol + '//' + currentUrl.host + '/devdocs/welcome';

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

		ReactDom.render(
			React.createElement( EmptyContent, {
				title: 'Log In to start hacking',
				line: 'Required to access the WordPress.com API',
				action: 'Log In to WordPress.com',
				actionURL: 'https://wordpress.com/wp-login.php?redirect_to=' + encodeURIComponent( redirectUrl ),
				secondaryAction: 'Register',
				secondaryActionURL: '/start/developer',
				illustration: '/calypso/images/drake/drake-nosites.svg'
			} ),
			document.getElementById( 'primary' )
		);
	},

	// Welcome screen
	welcome: function( context ) { // eslint-disable-line no-unused-vars
		ReactDom.render(
			React.createElement( DevWelcome, {} ),
			document.getElementById( 'primary' )
		);
	}
};

module.exports = devdocs;
