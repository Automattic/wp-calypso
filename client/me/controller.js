import i18n from 'i18n-calypso';
import page from 'page';
import { createElement } from 'react';
import AppsComponent from 'calypso/me/get-apps';
import SidebarComponent from 'calypso/me/sidebar';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';

export function sidebar( context, next ) {
	context.secondary = createElement( SidebarComponent, {
		context: context,
	} );

	next();
}

export function profile( context, next ) {
	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'My Profile', { textOnly: true } ) ) );

	const ProfileComponent = require( 'calypso/me/profile' ).default;

	context.primary = createElement( ProfileComponent, {
		path: context.path,
	} );
	next();
}

export function apps( context, next ) {
	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Get Apps', { textOnly: true } ) ) );

	context.primary = createElement( AppsComponent, {
		path: context.path,
	} );
	next();
}

export function profileRedirect() {
	page.redirect( '/me' );
}
