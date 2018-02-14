/** @format */

/**
 * External dependencies
 */

import React from 'react';
import { includes } from 'lodash';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { sectionify } from 'lib/route';
import userSettings from 'lib/user-settings';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import { setSection } from 'state/ui/actions';
import SidebarComponent from 'me/sidebar';
import AppsComponent from 'me/get-apps';
import NextSteps from './next-steps';

const ANALYTICS_PAGE_TITLE = 'Me';

export default {
	sidebar( context, next ) {
		context.secondary = React.createElement( SidebarComponent, {
			context: context,
		} );

		next();
	},

	profile( context, next ) {
		const basePath = context.path;

		context.store.dispatch( setTitle( i18n.translate( 'My Profile', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > My Profile' );

		const ProfileComponent = require( 'me/profile' ).default;

		context.primary = React.createElement( ProfileComponent, {
			userSettings: userSettings,
			path: context.path,
		} );
		next();
	},

	apps( context, next ) {
		const basePath = context.path;

		context.store.dispatch( setTitle( i18n.translate( 'Get Apps', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		analytics.pageView.record( basePath, ANALYTICS_PAGE_TITLE + ' > Get Apps' );

		context.primary = React.createElement( AppsComponent, {
			userSettings: userSettings,
			path: context.path,
		} );
		next();
	},

	nextSteps( context, next ) {
		const analyticsBasePath = sectionify( context.path );
		const isWelcome = 'welcome' === context.params.welcome;

		context.store.dispatch( setTitle( i18n.translate( 'Next Steps', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		if ( isWelcome ) {
			context.store.dispatch( setSection( null, { hasSidebar: false } ) );
		}

		analytics.tracks.recordEvent( 'calypso_me_next_view', { is_welcome: isWelcome } );
		analytics.pageView.record( analyticsBasePath, ANALYTICS_PAGE_TITLE + ' > Next' );

		context.primary = React.createElement( NextSteps, {
			path: context.path,
			isWelcome: isWelcome,
		} );
		next();
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
	},
};
