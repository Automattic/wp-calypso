import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { login } from 'calypso/lib/paths';
import { CONTACT, SUPPORT_ROOT } from 'calypso/lib/url/support';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
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

	const HelpTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Help', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<HelpTitle />
			<HelpComponent path={ context.path } />
		</>
	);
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
