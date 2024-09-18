import page from '@automattic/calypso-router';
import { useTranslate } from 'i18n-calypso';
import { createElement } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import AppsComponent from 'calypso/me/get-apps';
import SidebarComponent from 'calypso/me/sidebar';
import EmailVerificationBanner from './email-verification-banner';

export function sidebar( context, next ) {
	context.secondary = createElement( SidebarComponent, {
		context: context,
	} );

	next();
}

export function profile( context, next ) {
	const ProfileComponent = require( 'calypso/me/profile' ).default;
	const ProfileTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'My Profile', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<EmailVerificationBanner />
			<ProfileTitle />
			<ProfileComponent path={ context.path } />
		</>
	);
	next();
}

export function apps( context, next ) {
	const AppsTitle = () => {
		const translate = useTranslate();

		return <DocumentHead title={ translate( 'Get Apps', { textOnly: true } ) } />;
	};

	context.primary = (
		<>
			<AppsTitle />
			<AppsComponent path={ context.path } />
		</>
	);
	next();
}

export function profileRedirect() {
	page.redirect( '/me' );
}
