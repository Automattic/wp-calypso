import i18n from 'i18n-calypso';
import { login } from 'calypso/lib/paths';
import { CONTACT, SUPPORT_ROOT } from 'calypso/lib/url/support';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setDocumentHeadTitle as setTitle } from 'calypso/state/document-head/actions';
import ContactComponent from './help-contact';
import CoursesComponent from './help-courses';
import HelpComponent from './main';

export function loggedOut( context, next ) {
	if ( isUserLoggedIn( context.store.getState() ) ) {
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
	// Scroll to the top
	if ( typeof window !== 'undefined' ) {
		window.scrollTo( 0, 0 );
	}

	// FIXME: Auto-converted from the setTitle action. Please use <DocumentHead> instead.
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

	context.primary = <ContactComponent />;
	next();
}
