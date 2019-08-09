/**
 * Internal dependencies
 */
import { getNewSitePublicSetting, shouldBePrivateByDefault } from '../private-by-default';

jest.mock( 'lib/abtest', () => ( {
	abtest: testName => ( testName === 'privateByDefault' ? 'selected' : '' ),
} ) );

describe( 'getNewSitePublicSetting()', () => {
	test( 'should return `-1` by default', () => {
		expect( getNewSitePublicSetting() ).toBe( -1 );
	} );

	test( 'should return `-1` for invalid siteType', () => {
		expect( getNewSitePublicSetting( 'someOtherSiteType' ) ).toBe( -1 );
	} );

	test( 'should return `-1` for business segment', () => {
		expect( getNewSitePublicSetting( 'business' ) ).toBe( -1 );
	} );

	test( 'should return `-1` for blog segment', () => {
		expect( getNewSitePublicSetting( 'blog' ) ).toBe( -1 );
	} );

	test( 'should return `1` for online-store segment', () => {
		expect( getNewSitePublicSetting( 'online-store' ) ).toBe( 1 );
	} );

	test( 'should return `-1` for professional segment', () => {
		expect( getNewSitePublicSetting( 'professional' ) ).toBe( -1 );
	} );
} );

describe( 'shouldBePrivateByDefault()', () => {
	test( 'should be true with no input', () => {
		expect( shouldBePrivateByDefault() ).toBe( true );
	} );

	test( 'should return `true` for invalid siteType', () => {
		expect( shouldBePrivateByDefault( 'someOtherSiteType' ) ).toBe( true );
	} );

	test( 'should return `true` for business segment', () => {
		expect( shouldBePrivateByDefault( 'business' ) ).toBe( true );
	} );

	test( 'should return `true` for blog segment', () => {
		expect( shouldBePrivateByDefault( 'blog' ) ).toBe( true );
	} );

	test( 'should return `false` for online-store segment', () => {
		expect( shouldBePrivateByDefault( 'online-store' ) ).toBe( false );
	} );

	test( 'should return `true` for professional segment', () => {
		expect( shouldBePrivateByDefault( 'professional' ) ).toBe( true );
	} );
} );
