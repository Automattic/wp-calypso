import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { CONTACT, SUPPORT_ROOT } from '@automattic/urls';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import DocumentHead from 'calypso/components/data/document-head';
import { login } from 'calypso/lib/paths';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import HelpComponent from './main';

export function loggedOut( context, next ) {
	if ( isUserLoggedIn( context.store.getState() ) ) {
		return next();
	}

	let url;
	switch ( context.path ) {
		case '/help':
			url = localizeUrl( SUPPORT_ROOT );
			break;
		case '/help/contact':
			url = localizeUrl( CONTACT );
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

export function contactRedirect( context ) {
	const state = context.store.getState();
	const previousRoute = getPreviousRoute( state );
	page.redirect( addQueryArgs( '/help', { from: previousRoute } ) );
}
