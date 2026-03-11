/** @jest-environment jsdom */
import React from 'react';
import { getPartnerSignupTosElement } from 'calypso/lib/partner-branding';
import { getMagicLoginInitialHeaders, MagicLogin } from '../index';

jest.mock( 'calypso/lib/partner-branding', () => ( {
	detectCiabConfig: jest.fn(),
	getPartnerSignupTosElement: jest.fn(),
} ) );

describe( 'magic-login branding behavior', () => {
	const baseProps = {
		path: '/log-in/link',
		recordPageView: jest.fn(),
		recordTracksEvent: jest.fn(),
		locale: 'en',
		query: {},
		showCheckYourEmail: false,
		emailRequested: false,
		twoFactorNotificationSent: null,
		redirectToSanitized: '',
		translate: ( text ) => text,
		oauth2Client: null,
		isWooJPC: false,
		ciabConfig: null,
	};

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'overrides heading for a branded partner flow', () => {
		const translate = jest.fn( ( text, options ) => {
			if ( options?.args?.partnerName ) {
				return `Log in to ${ options.args.partnerName }`;
			}

			return text;
		} );

		const { heading } = getMagicLoginInitialHeaders(
			{
				...baseProps,
				ciabConfig: {
					displayName: 'Woo',
				},
			},
			translate
		);

		expect( heading ).toBe( 'Log in to Woo' );
		expect( translate ).toHaveBeenCalledWith( 'Log in to %(partnerName)s', {
			args: {
				partnerName: 'Woo',
			},
		} );
	} );

	it( 'falls back to default heading when no partner config is present', () => {
		const translate = jest.fn( ( text ) => text );

		const { heading } = getMagicLoginInitialHeaders( baseProps, translate );

		expect( heading ).toBe( 'Email me a login link' );
	} );

	it( 'uses partner ToS when available', () => {
		const partnerTosElement = <span>Partner ToS</span>;
		getPartnerSignupTosElement.mockReturnValue( partnerTosElement );

		const instance = new MagicLogin( {
			...baseProps,
			ciabConfig: { id: 'woo', displayName: 'Woo' },
		} );

		expect( instance.renderTos() ).toBe( partnerTosElement );
	} );

	it( 'uses fallback ToS when partner ToS is unavailable', () => {
		getPartnerSignupTosElement.mockReturnValue( undefined );
		const translate = jest.fn( ( text ) => text );

		const instance = new MagicLogin( {
			...baseProps,
			translate,
		} );

		const tos = instance.renderTos();

		expect( tos ).toContain( 'By continuing you agree to our' );
		expect( translate ).toHaveBeenCalledWith(
			expect.stringContaining( 'By continuing you agree to our' ),
			expect.objectContaining( {
				components: expect.objectContaining( {
					privacyLink: expect.anything(),
					tosLink: expect.anything(),
				} ),
			} )
		);
	} );

	it( 'hides the app promo in check-your-email when partner branding is enabled', () => {
		const instance = new MagicLogin( {
			...baseProps,
			showCheckYourEmail: true,
			ciabConfig: { id: 'woo', displayName: 'Woo' },
		} );

		expect( instance.renderLinks() ).toBeNull();
	} );

	it( 'shows the app promo in check-your-email when partner branding is not enabled', () => {
		const instance = new MagicLogin( {
			...baseProps,
			showCheckYourEmail: true,
			ciabConfig: null,
		} );

		expect( instance.renderLinks() ).toEqual(
			expect.objectContaining( {
				props: expect.objectContaining( {
					campaign: 'calypso-login-link-check-email',
					className: 'magic-link-app-promo',
				} ),
			} )
		);
	} );
} );
