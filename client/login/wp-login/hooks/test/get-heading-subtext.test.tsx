/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { useTranslate } from 'i18n-calypso';
import getHeadingSubText from '../get-heading-subtext';

describe( 'getHeadingSubText', () => {
	const translate = ( ( text ) => text ) as ReturnType< typeof useTranslate >;

	test( 'appends partner consent copy when ToS is primary', () => {
		const subtext = getHeadingSubText( {
			isSocialFirst: true,
			twoFactorAuthType: '',
			action: 'login',
			translate,
			isWooJPC: false,
			partnerConfig: {
				id: 'woo',
				displayName: 'Woo',
				featureFlag: 'ciab/custom-branding',
				logo: { src: 'logo.svg', alt: 'Woo' },
				ssoProviders: [ 'google' ],
			},
		} );

		render( <>{ subtext?.primary }</> );

		expect( screen.getByText( /WordPress.com is used to manage your account\./ ) ).toBeVisible();
	} );

	test( 'appends partner consent copy when ToS is secondary', () => {
		const subtext = getHeadingSubText( {
			isSocialFirst: true,
			twoFactorAuthType: '',
			action: 'login',
			translate,
			isWooJPC: true,
			partnerConfig: {
				id: 'woo',
				displayName: 'Woo',
				featureFlag: 'ciab/custom-branding',
				logo: { src: 'logo.svg', alt: 'Woo' },
				ssoProviders: [ 'google' ],
			},
		} );

		render( <>{ subtext?.secondary }</> );

		expect( screen.getByText( /WordPress.com is used to manage your account\./ ) ).toBeVisible();
	} );

	test( 'returns the family-driven login subtitle (site noun) and keeps the ToS as secondary when from=jetpack-connector with a Jetpack-family plugin', () => {
		const subtext = getHeadingSubText( {
			isSocialFirst: true,
			twoFactorAuthType: '',
			action: 'login',
			translate,
			isFromJetpackConnector: true,
			connectorPlugins: [ 'jetpack' ],
		} );

		expect( subtext?.primary ).toBe(
			'Your site is registered with WordPress.com — finish connecting your account to power Jetpack with backups, security, and growth tools.'
		);
		expect( subtext?.secondary ).toBeTruthy();
		render( <>{ subtext?.secondary }</> );
		expect(
			screen.getByText( /By continuing with any of the options below, you agree to our/ )
		).toBeVisible();
	} );

	test( 'uses the store wording and the Woo+Jetpack scenario when from=jetpack-connector with both families', () => {
		const subtext = getHeadingSubText( {
			isSocialFirst: true,
			twoFactorAuthType: '',
			action: 'login',
			translate,
			isFromJetpackConnector: true,
			connectorPlugins: [ 'woocommerce', 'jetpack' ],
		} );

		expect( subtext?.primary ).toBe(
			'Your store is registered with WordPress.com — finish connecting your account to use the Woo mobile app, access your store analytics, and power Jetpack features.'
		);
		expect( subtext?.secondary ).toBeTruthy();
	} );

	test( 'falls back to lostpassword instructions even when from=jetpack-connector', () => {
		const subtext = getHeadingSubText( {
			isSocialFirst: true,
			twoFactorAuthType: '',
			action: 'lostpassword',
			translate,
			isFromJetpackConnector: true,
			connectorPlugins: [ 'jetpack' ],
		} );

		expect( subtext?.primary ).toBe(
			"Please enter your username or email address. You'll receive a link to create a new password via email."
		);
	} );

	test.each( [
		[ 'authenticator', false, 'Enter the code from your authenticator app.' ],
		[ 'authenticator', true, 'Enter the code from the email we sent you.' ],
		[ 'email', true, 'Enter the code from the email we sent you.' ],
		[ 'sms', false, 'Enter the code from the text message we sent you.' ],
		[
			'backup',
			false,
			'Enter a backup code to continue. Use one of the 10 codes you received during setup.',
		],
		[ 'push', false, 'Check your device. Approve your login with the Jetpack mobile app.' ],
	] )(
		'shows the help text of the %s two-step screen as the subtitle (email nonce: %s)',
		( twoFactorAuthType, hasTwoFactorEmailNonce, expected ) => {
			const subtext = getHeadingSubText( {
				isSocialFirst: true,
				twoFactorAuthType: twoFactorAuthType as string,
				hasTwoFactorEmailNonce: hasTwoFactorEmailNonce as boolean,
				translate,
			} );

			expect( subtext?.primary ).toBe( expected );
			expect( subtext?.secondary ).toBeNull();
		}
	);

	test( 'has no subtitle on two-step screens without a help text', () => {
		expect(
			getHeadingSubText( { isSocialFirst: true, twoFactorAuthType: 'webauthn', translate } )
		).toBeNull();
		expect(
			getHeadingSubText( { isSocialFirst: true, twoFactorAuthType: 'link', translate } )
		).toBeNull();
	} );

	test( 'leaves the two-step help text to the form on Gravatar-powered logins', () => {
		expect(
			getHeadingSubText( { isSocialFirst: false, twoFactorAuthType: 'sms', translate } )
		).toBeNull();
	} );
} );
