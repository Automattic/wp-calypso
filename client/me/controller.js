/** @format */

/**
 * External dependencies
 */

import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userSettings from 'lib/user-settings';
import { setDocumentHeadTitle as setTitle } from 'state/document-head/actions';
import SidebarComponent from 'me/sidebar';
import AppsComponent from 'me/get-apps';

export default {
	sidebar( context, next ) {
		context.secondary = React.createElement( SidebarComponent, {
			context: context,
		} );

		next();
	},

	profile( context, next ) {
		context.store.dispatch( setTitle( i18n.translate( 'My Profile', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		const ProfileComponent = require( 'me/profile' ).default;

		context.primary = React.createElement( ProfileComponent, {
			userSettings: userSettings,
			path: context.path,
		} );
		next();
	},

	apps( context, next ) {
		context.store.dispatch( setTitle( i18n.translate( 'Get Apps', { textOnly: true } ) ) ); // FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.

		context.primary = React.createElement( AppsComponent, {
			userSettings: userSettings,
			path: context.path,
		} );
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
