/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getEmailTrackingConsentPayload } from 'calypso/lib/signup/email-tracking-consent';
import { EmailTrackingConsent, useEmailTrackingConsent } from '../email-tracking-consent';

let mockLocale = 'en';

jest.mock( '@automattic/calypso-config', () => {
	const config = () => null;
	config.isEnabled = ( feature: string ) => feature === 'me/email-tracking-consent';
	return config;
} );

jest.mock( 'i18n-calypso', () => ( {
	useTranslate: () => ( { localeSlug: mockLocale } ),
} ) );

jest.mock( 'calypso/lib/i18n-utils', () => ( {
	getLocaleSlug: () => mockLocale,
} ) );

const Form = () => {
	const { isAsked, hasAgreed, setHasAgreed } = useEmailTrackingConsent();
	return isAsked ? <EmailTrackingConsent checked={ hasAgreed } onChange={ setHasAgreed } /> : null;
};

describe( 'Email tracking consent at signup', () => {
	afterEach( () => {
		window.sessionStorage.clear();
	} );

	test( 'is not asked, and nothing is sent, on an English page', () => {
		mockLocale = 'en';
		render( <Form /> );

		expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		expect( getEmailTrackingConsentPayload() ).toEqual( {} );
	} );

	test.each( [ 'fr', 'it', 'fr-ca' ] )( 'is asked unticked on a %s page', ( locale ) => {
		mockLocale = locale;
		render( <Form /> );

		expect( screen.getByRole( 'checkbox' ) ).not.toBeChecked();
		expect( getEmailTrackingConsentPayload() ).toEqual( { email_tracking: false } );
	} );

	test( 'sends the answer once ticked, and nothing after leaving the form', async () => {
		mockLocale = 'fr';
		const { unmount } = render( <Form /> );

		await userEvent.click( screen.getByRole( 'checkbox' ) );
		expect( getEmailTrackingConsentPayload() ).toEqual( { email_tracking: true } );

		unmount();
		expect( getEmailTrackingConsentPayload() ).toEqual( {} );
	} );

	test( 'does not send an answer left over from a French page on an English page', () => {
		mockLocale = 'en';
		window.sessionStorage.setItem( 'signup_email_tracking_consent', 'true' );
		render( <Form /> );

		expect( getEmailTrackingConsentPayload() ).toEqual( {} );
	} );

	test( 'keeps a ticked answer across a page reload', () => {
		mockLocale = 'fr';
		window.sessionStorage.setItem( 'signup_email_tracking_consent', 'true' );
		render( <Form /> );

		expect( screen.getByRole( 'checkbox' ) ).toBeChecked();
	} );
} );
