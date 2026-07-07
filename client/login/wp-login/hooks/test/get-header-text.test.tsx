/**
 * @jest-environment jsdom
 */

import { useTranslate } from 'i18n-calypso';
import { getMobileAppClientName } from '../get-header-text';

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
