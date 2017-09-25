/**
 * External dependencies
 */
import { debounce } from 'lodash';
import page from 'page';
import qs from 'qs';
import React from 'react';
import ReactDom from 'react-dom';

/**
 * Internal dependencies
 */
import DesignAssetsComponent from './design';
import Blocks from './design/blocks';
import Typography from './design/typography';
import SingleDocComponent from './doc';
import DocsSelectors from './docs-selectors';
import FormStateExamplesComponent from './form-state-examples';
import DocsComponent from './main';
import Sidebar from './sidebar';
import DevWelcome from './welcome';
import WizardComponent from './wizard-component';
import EmptyContent from 'components/empty-content';
import config from 'config';
import { login } from 'lib/paths';
import { renderWithReduxStore } from 'lib/react-helpers';
import url from 'url';

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
			const query = context.query;

			if ( searchTerm ) {
				query.term = searchTerm;
			} else {
				delete query.term;
			}

			const queryString = qs.stringify( query ).replace( /%20/g, '+' ).trim();

			let newUrl = context.pathname;

			if ( queryString ) {
				newUrl += '?' + queryString;
			}

			page.replace( newUrl,
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
		renderWithReduxStore(
			React.createElement( DesignAssetsComponent, {
				component: context.params.component
			} ),
			'primary',
			context.store
		);
	},

	wizard: function( context ) {
		renderWithReduxStore(
			<WizardComponent stepName={ context.params.stepName } />,
			'primary',
			context.store
		);
	},

	// App Blocks
	blocks: function( context ) {
		renderWithReduxStore(
			React.createElement( Blocks, {
				component: context.params.component
			} ),
			'primary',
			context.store
		);
	},

	selectors: function( context ) {
		renderWithReduxStore(
			React.createElement( DocsSelectors, {
				selector: context.params.selector,
				search: context.query.search
			} ),
			'primary',
			context.store
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

	pleaseLogIn: function( context ) { // eslint-disable-line no-unused-vars
		const currentUrl = url.parse( location.href );
		const redirectTo = currentUrl.protocol + '//' + currentUrl.host + '/devdocs/welcome';

		ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );

		ReactDom.render(
			React.createElement( EmptyContent, {
				title: 'Log In to start hacking',
				line: 'Required to access the WordPress.com API',
				action: 'Log In to WordPress.com',
				actionURL: login( { isNative: config.isEnabled( 'login/native-login-links' ), redirectTo } ),
				secondaryAction: 'Register',
				secondaryActionURL: '/start/developer',
				illustration: '/calypso/images/illustrations/illustration-nosites.svg'
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

export default devdocs;
