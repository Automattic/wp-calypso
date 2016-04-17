/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import qs from 'qs';
import debounce from 'lodash/debounce';
import page from 'page';
import { Provider as ReduxProvider } from 'react-redux';

/**
 * Internal dependencies
 */
import DocsComponent from './main';
import SingleDocComponent from './doc';
import DesignAssetsComponent from './design';
import AppComponents from './design/app-components';
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
			var query = context.query;
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
				sectionId: Object.keys( context.hash )[0]
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

	// App components
	appComponents: function( context ) {
		ReactDom.render(
			React.createElement( ReduxProvider, { store: context.store },
				React.createElement( AppComponents, {
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

	pleaseLogIn: function( context ) {
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
		ReactDom.render(
			React.createElement( DevWelcome, {} ),
			document.getElementById( 'primary' )
		);
	}
};

module.exports = devdocs;
