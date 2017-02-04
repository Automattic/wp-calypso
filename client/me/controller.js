/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import includes from 'lodash/includes';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import route from 'lib/route';
import userSettings from 'lib/user-settings';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { renderPage } from 'lib/react-helpers';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	sidebar( context, next ) {
		const SidebarComponent = require( 'me/sidebar' );

		renderPage(
			React.createElement( SidebarComponent, {
				context: context
			} ),
			context,
			'secondary'
		);

		next();
	},

	profile( context ) {
		const ProfileComponent = require( 'me/profile' ),
			basePath = context.path;

		context.store.dispatch( setTitle( i18n.translate( 'My Profile', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > My Profile' );

		renderPage(
			React.createElement( ProfileComponent,
				{
					userSettings: userSettings,
					path: context.path
				}
			),
			context
		);
	},

	apps( context ) {
		const AppsComponent = require( 'me/get-apps' ),
			basePath = context.path;

		context.store.dispatch( setTitle( i18n.translate( 'Get Apps', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Get Apps' );

		renderPage(
			React.createElement( AppsComponent,
				{
					userSettings: userSettings,
					path: context.path
				}
			),
			context
		);
	},

	nextSteps( context ) {
		const analyticsBasePath = route.sectionify( context.path ),
			NextSteps = require( './next-steps' ),
			trophiesData = require( 'lib/trophies-data' ),
			isWelcome = 'welcome' === context.params.welcome;

		context.store.dispatch( setTitle( i18n.translate( 'Next Steps', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		if ( isWelcome ) {
			ReactDom.unmountComponentAtNode( document.getElementById( 'secondary' ) );
		}

		analytics.tracks.recordEvent( 'calypso_me_next_view', { is_welcome: isWelcome } );
		analytics.pageView.record( analyticsBasePath, ANALYTICS_PAGE_TITLE + ' > Next' );

		renderPage(
			React.createElement( NextSteps, {
				path: context.path,
				isWelcome: isWelcome,
				trophiesData: trophiesData
			} ),
			context
		);
	},

	// Users that are redirected to `/me/next?welcome` after signup should visit
	// `/me/next/welcome` instead.
	nextStepsWelcomeRedirect( context, next ) {
		if ( includes( context.path, '?welcome' ) ) {
			return page.redirect( '/me/next/welcome' );
		}

		next();
	},

	profileRedirect() {
		page.redirect( '/me' );
	},

	trophiesRedirect() {
		page.redirect( '/me' );
	},

	findFriendsRedirect() {
		page.redirect( '/me' );
	}
};
