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

	test( 'returns the registration acknowledgement (site) when from=jetpack-connector with no Woo plugins', () => {
		const subtext = getHeadingSubText( {
			isSocialFirst: true,
			twoFactorAuthType: '',
			action: 'login',
			translate,
			isFromJetpackConnector: true,
			connectorPlugins: [ 'jetpack' ],
		} );

		expect( subtext ).toEqual( {
			primary: 'Your site is registered with WordPress.com.',
			secondary: null,
		} );
	} );

	test( 'returns the registration acknowledgement (store) when from=jetpack-connector with a Woo plugin', () => {
		const subtext = getHeadingSubText( {
			isSocialFirst: true,
			twoFactorAuthType: '',
			action: 'login',
			translate,
			isFromJetpackConnector: true,
			connectorPlugins: [ 'woocommerce', 'jetpack' ],
		} );

		expect( subtext ).toEqual( {
			primary: 'Your store is registered with WordPress.com.',
			secondary: null,
		} );
	} );

	test( 'falls back to standard subtext on lostpassword even if from=jetpack-connector', () => {
		const subtext = getHeadingSubText( {
			isSocialFirst: true,
			twoFactorAuthType: '',
			action: 'lostpassword',
			translate,
			isFromJetpackConnector: true,
			connectorPlugins: [ 'jetpack' ],
		} );

		expect( subtext?.primary ).not.toBe( 'Your site is registered with WordPress.com.' );
	} );
} );
