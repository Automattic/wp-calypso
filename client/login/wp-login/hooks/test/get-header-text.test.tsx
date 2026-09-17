/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/react';
import { useTranslate, translate, type TranslateResult } from 'i18n-calypso';
import { getHeaderText, getMobileAppClientName } from '../get-header-text';

describe( 'getMobileAppClientName', () => {
	const translate = ( ( text: string ) => text ) as ReturnType< typeof useTranslate >;

	test( 'brands the Jetpack app per platform', () => {
		expect(
			getMobileAppClientName( { oauth2Client: { id: 11 }, isJetpackApp: true, translate } )
		).toBe( 'Jetpack for iOS' );
		expect(
			getMobileAppClientName( { oauth2Client: { id: 2697 }, isJetpackApp: true, translate } )
		).toBe( 'Jetpack for Android' );
		// Beta/alpha/trial clients share the platform.
		expect(
			getMobileAppClientName( { oauth2Client: { id: 29217 }, isJetpackApp: true, translate } )
		).toBe( 'Jetpack for iOS' );
	} );

	test( 'brands the WordPress app per platform when it is not a jetpack:// request', () => {
		expect(
			getMobileAppClientName( { oauth2Client: { id: 11 }, isJetpackApp: false, translate } )
		).toBe( 'WordPress for iOS' );
		expect(
			getMobileAppClientName( { oauth2Client: { id: 2697 }, isJetpackApp: false, translate } )
		).toBe( 'WordPress for Android' );
	} );

	test( 'defaults to WordPress branding when the app is unknown (no redirect_uri)', () => {
		expect( getMobileAppClientName( { oauth2Client: { id: 11 }, translate } ) ).toBe(
			'WordPress for iOS'
		);
	} );

	test( 'returns null for non-mobile clients so their own title is used', () => {
		expect(
			getMobileAppClientName( { oauth2Client: { id: 1854 }, isJetpackApp: true, translate } )
		).toBeNull();
		expect(
			getMobileAppClientName( { oauth2Client: null, isJetpackApp: false, translate } )
		).toBeNull();
	} );
} );

describe( 'getHeaderText client-name casing', () => {
	// The client-name span is `text-transform: capitalize`. Resolved brand names are
	// authoritative and opt out via `is-exact-case`; only the raw client slug keeps
	// the default title-casing.
	const renderClientName = (
		oauth2Client: { id: number; name?: string },
		isJetpackApp?: boolean
	) => {
		const headerText = getHeaderText( {
			isSocialFirst: true,
			twoFactorAuthType: null,
			isManualRenewalImmediateLoginAttempt: false,
			socialConnect: false,
			linkingSocialService: '',
			action: 'login',
			currentQuery: {},
			oauth2Client,
			isJetpackApp,
			translate: translate as unknown as ( arg0: string, arg1?: object ) => TranslateResult,
		} as Parameters< typeof getHeaderText >[ 0 ] );
		const { container } = render( <div>{ headerText }</div> );
		return container.querySelector( '.wp-login__one-login-header-client-name' );
	};

	test( 'renders the mobile app title verbatim (is-exact-case)', () => {
		const clientName = renderClientName( { id: 11 }, true );
		expect( clientName ).toBeVisible();
		expect( clientName ).toHaveClass( 'is-exact-case' );
		expect( clientName ).toHaveTextContent( 'Jetpack for iOS' );
	} );

	test( 'renders other known brand names verbatim (is-exact-case)', () => {
		// 68663 => Jetpack Cloud.
		const jetpackCloud = renderClientName( { id: 68663 } );
		expect( jetpackCloud ).toHaveClass( 'is-exact-case' );
		expect( jetpackCloud ).toHaveTextContent( 'Jetpack Cloud' );

		// 95928 => Automattic for Agencies — the lowercase "for" must survive.
		const a4a = renderClientName( { id: 95928 } );
		expect( a4a ).toHaveClass( 'is-exact-case' );
		expect( a4a ).toHaveTextContent( 'Automattic for Agencies' );
	} );

	test( 'keeps title-casing (no is-exact-case) for an unbranded client slug', () => {
		// 978 => Crowdsignal, which falls through to the raw `name` slug.
		const clientName = renderClientName( { id: 978, name: 'crowdsignal' } );
		expect( clientName ).toBeVisible();
		expect( clientName ).not.toHaveClass( 'is-exact-case' );
		expect( clientName ).toHaveTextContent( 'crowdsignal' );
	} );
} );
