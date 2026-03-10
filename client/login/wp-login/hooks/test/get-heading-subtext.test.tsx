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
			ciabConfig: {
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
			ciabConfig: {
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
} );
