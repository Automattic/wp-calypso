/**
 * Internal dependencies
 */
import { getNewSitePublicSetting, shouldBePrivateByDefault } from '../private-by-default';

describe( 'getNewSitePublicSetting()', () => {
	test( 'should return `-1` by default', () => {
		expect( getNewSitePublicSetting() ).toBe( -1 );
	} );

	test( 'should return `-1` for onboarding flow', () => {
		expect( getNewSitePublicSetting( null, { flowName: 'onboarding' } ) ).toBe( -1 );
	} );

	test( 'should return `1` for ecommerce flow', () => {
		expect( getNewSitePublicSetting( null, { flowName: 'ecommerce' } ) ).toBe( 1 );
	} );

	test( 'should return `1` for ecommerce-onboarding flow', () => {
		expect( getNewSitePublicSetting( null, { flowName: 'ecommerce-onboarding' } ) ).toBe( 1 );
	} );
} );

describe( 'shouldBePrivateByDefault()', () => {
	test( 'should return `true` by default', () => {
		expect( shouldBePrivateByDefault() ).toBeTrue;
	} );

	test( 'should return `true` for onboarding flow', () => {
		expect( shouldBePrivateByDefault( { flowName: 'onboarding' } ) ).toBeTrue;
	} );

	test( 'should return `false` for ecommerce flow', () => {
		expect( shouldBePrivateByDefault( { flowName: 'ecommerce' } ) ).toBeFalse;
	} );

	test( 'should return `false` for ecommerce-onboarding flow', () => {
		expect( shouldBePrivateByDefault( { flowName: 'ecommerce-onboarding' } ) ).toBeFalse;
	} );
} );
