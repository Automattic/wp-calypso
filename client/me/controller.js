/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import userSettings from 'calypso/lib/user-settings';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import SidebarComponent from 'calypso/me/sidebar';
import AppsComponent from 'calypso/me/get-apps';

export function sidebar( context, next ) {
	context.secondary = React.createElement( SidebarComponent, {
		context: context,
	} );

	next();
}

export function profile( context, next ) {
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'My Profile', { textOnly: true } ) ) );

	const ProfileComponent = require( 'calypso/me/profile' ).default;

	context.primary = React.createElement( ProfileComponent, {
		userSettings: userSettings,
		path: context.path,
	} );
	next();
}

export function apps( context, next ) {
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Get Apps', { textOnly: true } ) ) );

	context.primary = React.createElement( AppsComponent, {
		path: context.path,
	} );
	next();
}

export function profileRedirect() {
	page.redirect( '/me' );
}
