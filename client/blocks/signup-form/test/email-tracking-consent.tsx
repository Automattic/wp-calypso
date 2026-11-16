/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
	forgetSavedEmailTrackingConsent,
	getEmailTrackingConsentPayload,
	getEmailTrackingConsentPayloadForSocialLogin,
	saveEmailTrackingConsentForSocialLogin,
} from 'calypso/lib/signup/email-tracking-consent';
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

const Form = () => {
	const { isAsked, hasAgreed, setHasAgreed } = useEmailTrackingConsent();
	return isAsked ? <EmailTrackingConsent checked={ hasAgreed } onChange={ setHasAgreed } /> : null;
};

describe( 'Email tracking consent at signup', () => {
	afterEach( () => {
		jest.restoreAllMocks();
		window.sessionStorage.clear();
	} );

	test( 'is not asked, and nothing is sent, on an English page', () => {
		mockLocale = 'en';
		render( <Form /> );

		expect( screen.queryByRole( 'checkbox' ) ).not.toBeInTheDocument();
		expect( getEmailTrackingConsentPayload() ).toEqual( {} );
		expect( getEmailTrackingConsentPayloadForSocialLogin() ).toEqual( {} );
	} );

	test.each( [ 'fr', 'it', 'fr-ca' ] )( 'is asked unticked on a %s page', ( locale ) => {
		mockLocale = locale;
		render( <Form /> );

		expect( screen.getByRole( 'checkbox' ) ).not.toBeChecked();
		expect( getEmailTrackingConsentPayload() ).toEqual( { email_tracking: false } );
		expect( getEmailTrackingConsentPayloadForSocialLogin() ).toEqual( { email_tracking: false } );
	} );

	test( 'sends the answer once ticked, and nothing after leaving the form', async () => {
		mockLocale = 'fr';
		const { unmount } = render( <Form /> );

		await userEvent.click( screen.getByRole( 'checkbox' ) );
		expect( getEmailTrackingConsentPayload() ).toEqual( { email_tracking: true } );

		unmount();
		expect( getEmailTrackingConsentPayload() ).toEqual( {} );
	} );

	test( 'does not need browser storage for an email signup', () => {
		mockLocale = 'fr';
		jest.spyOn( Storage.prototype, 'setItem' ).mockImplementation( () => {
			throw new Error( 'QuotaExceededError' );
		} );
		render( <Form /> );
		saveEmailTrackingConsentForSocialLogin();

		expect( getEmailTrackingConsentPayload() ).toEqual( { email_tracking: false } );
	} );

	test( 'carries the answer through a social login that returns to an English page', async () => {
		mockLocale = 'fr';
		const { unmount } = render( <Form /> );
		await userEvent.click( screen.getByRole( 'checkbox' ) );
		saveEmailTrackingConsentForSocialLogin();
		unmount();

		mockLocale = 'en';
		render( <Form /> );

		// An email signup from the English page sends nothing; the returning social signup does.
		expect( getEmailTrackingConsentPayload() ).toEqual( {} );
		expect( getEmailTrackingConsentPayloadForSocialLogin() ).toEqual( { email_tracking: true } );

		forgetSavedEmailTrackingConsent();
		expect( getEmailTrackingConsentPayloadForSocialLogin() ).toEqual( {} );
	} );

	test( 'keeps the answer when a social login returns to the form', async () => {
		mockLocale = 'fr';
		const { unmount } = render( <Form /> );
		await userEvent.click( screen.getByRole( 'checkbox' ) );
		saveEmailTrackingConsentForSocialLogin();
		unmount();

		render( <Form /> );

		expect( screen.getByRole( 'checkbox' ) ).toBeChecked();
	} );

	test( 'starts unticked again after a plain reload', async () => {
		mockLocale = 'fr';
		const { unmount } = render( <Form /> );
		await userEvent.click( screen.getByRole( 'checkbox' ) );
		unmount();

		render( <Form /> );

		expect( screen.getByRole( 'checkbox' ) ).not.toBeChecked();
	} );
} );
