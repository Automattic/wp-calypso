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
	// The client-name span is `text-transform: capitalize`. Pre-branded mobile app
	// titles opt out via `is-exact-case`; every other client must keep the default.
	const renderClientName = ( oauth2Client: { id: number }, isJetpackApp?: boolean ) => {
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

	test( 'opts the mobile app title out of title-casing via is-exact-case', () => {
		const clientName = renderClientName( { id: 11 }, true );
		expect( clientName ).toBeVisible();
		expect( clientName ).toHaveClass( 'is-exact-case' );
		expect( clientName ).toHaveTextContent( 'Jetpack for iOS' );
	} );

	test( 'keeps title-casing (no is-exact-case) for a non-mobile client', () => {
		// 68663 => Jetpack Cloud.
		const clientName = renderClientName( { id: 68663 } );
		expect( clientName ).toBeVisible();
		expect( clientName ).not.toHaveClass( 'is-exact-case' );
		expect( clientName ).toHaveTextContent( 'Jetpack Cloud' );
	} );
} );
