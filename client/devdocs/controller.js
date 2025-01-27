import page from '@automattic/calypso-router';
import { debounce } from 'lodash';
import { stringify } from 'qs';
import { createElement } from 'react';
import noSitesIllustration from 'calypso/assets/images/illustrations/illustration-nosites.svg';
import EmptyContent from 'calypso/components/empty-content';
import { login } from 'calypso/lib/paths';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
// This is a custom AsyncLoad component for devdocs that includes a
// `props.component`-aware placeholder. It still needs to be imported as
// `AsyncLoad` though–see https://github.com/Automattic/babel-plugin-transform-wpcalypso-async/blob/HEAD/index.js#L12
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import AsyncLoad from './devdocs-async-load';
import SingleDocComponent from './doc';
import DocsComponent from './main';
import Sidebar from './sidebar';
import DevWelcome from './welcome';
import WizardComponent from './wizard-component';

const devdocs = {
	/*
	 * Documentation is rendered on #primary and doesn't expect a sidebar to exist
	 * so #secondary needs to be cleaned up
	 */
	sidebar: function ( context, next ) {
		context.secondary = createElement( Sidebar, {
			path: context.path,
		} );

		context.store.dispatch( setSelectedSiteId( null ) );
		next();
	},

	/*
	 * Controller for page listing multiple developer docs
	 */
	devdocs: function ( context, next ) {
		function onSearchChange( searchTerm ) {
			const query = context.query;

			if ( searchTerm ) {
				query.term = searchTerm;
			} else {
				delete query.term;
			}

			const queryString = stringify( query ).replace( /%20/g, '+' ).trim();

			let newUrl = context.pathname;

			if ( queryString ) {
				newUrl += '?' + queryString;
			}

			page.replace( newUrl, context.state, false, false );
		}

		context.primary = createElement( DocsComponent, {
			term: context.query.term,
			// we debounce with wait time of 0, so that the search doesn’t happen
			// in the same tick as the keyUp event and possibly cause typing lag
			onSearchChange: debounce( onSearchChange, 0 ),
		} );
		next();
	},

	/*
	 * Controller for single developer document
	 */
	singleDoc: function ( context, next ) {
		context.primary = createElement( SingleDocComponent, {
			path: context.params.path,
			term: context.query.term,
			sectionId: Object.keys( context.hash )[ 0 ],
		} );
		next();
	},

	// UI components
	design: function ( context, next ) {
		context.primary = <AsyncLoad component={ context.params.component } require="./design" />;
		next();
	},

	wizard: function ( context, next ) {
		context.primary = <WizardComponent stepName={ context.params.stepName } />;
		next();
	},

	// App Blocks
	blocks: function ( context, next ) {
		context.primary = (
			<AsyncLoad component={ context.params.component } require="./design/blocks" />
		);
		next();
	},

	playground: function ( context, next ) {
		context.primary = (
			<AsyncLoad component={ context.params.component } require="./design/playground" />
		);
		next();
	},

	wpComponentsGallery( context, next ) {
		context.primary = <AsyncLoad require="./design/wordpress-components-gallery" />;
		next();
	},

	selectors: function ( context, next ) {
		context.primary = (
			<AsyncLoad
				require="./docs-selectors"
				search={ context.query.search }
				selector={ context.params.selector }
			/>
		);
		next();
	},

	typography: function ( context, next ) {
		context.primary = (
			<AsyncLoad component={ context.params.component } require="./design/typography" />
		);
		next();
	},

	illustrations: function ( context, next ) {
		context.primary = (
			<AsyncLoad component={ context.params.component } require="./design/illustrations" />
		);
		next();
	},

	pleaseLogIn: function ( context, next ) {
		const redirectTo = window.location.origin + '/devdocs/welcome';
		if ( ! isUserLoggedIn( context.store.getState() ) ) {
			context.primary = createElement( EmptyContent, {
				title: 'Log In to start hacking',
				line: 'Required to access the WordPress.com API',
				action: 'Log In to WordPress.com',
				actionURL: login( { redirectTo } ),
				secondaryAction: 'Register',
				secondaryActionURL: '/start/account',
				illustration: noSitesIllustration,
			} );
			next();
		} else {
			page( redirectTo );
		}
	},

	// Welcome screen
	welcome: function ( context, next ) {
		context.primary = createElement( DevWelcome, {} );
		next();
	},
};

export default devdocs;
