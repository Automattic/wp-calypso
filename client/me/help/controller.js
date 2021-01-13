/**
 * External dependencies
 */

import React from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { login } from 'calypso/lib/paths';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import config from 'calypso/config';
import HelpComponent from './main';
import CoursesComponent from './help-courses';
import ContactComponent from './help-contact';
import { CONTACT, SUPPORT_ROOT } from 'calypso/lib/url/support';
import userUtils from 'calypso/lib/user/utils';

export function loggedOut( context, next ) {
	if ( userUtils.isLoggedIn() ) {
		return next();
	}

	let url;
	switch ( context.path ) {
		case '/help':
			url = SUPPORT_ROOT;
			break;
		case '/help/contact':
			url = CONTACT;
			break;
		default:
			url = login( { redirectTo: window.location.href } );
	}

	// Not using the page library here since this is an external URL
	window.location.href = url;
}

export function help( context, next ) {
	// FIXME: Auto-converted from the Flux setTitle action. Please use <DocumentHead> instead.
	context.store.dispatch( setTitle( i18n.translate( 'Help', { textOnly: true } ) ) );

	context.primary = <HelpComponent />;
	next();
}

export function courses( context, next ) {
	context.primary = <CoursesComponent />;
	next();
}

export function contact( context, next ) {
	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	context.primary = <ContactComponent clientSlug={ config( 'client_slug' ) } />;
	next();
}
