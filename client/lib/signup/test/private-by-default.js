/**
 * Internal dependencies
 */
import { getNewSitePublicSetting, shouldBePrivateByDefault } from '../private-by-default';

describe( 'getNewSitePublicSetting()', () => {
	test( 'should return `-1` by default', () => {
		expect( getNewSitePublicSetting( {}, {} ) ).toBe( -1 );
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
	test( 'should throw with no input', () => {
		expect( () => shouldBePrivateByDefault() ).toThrow( TypeError );
	} );

	test( 'should return `true` with no flowName or lastKnownFlow', () => {
		expect( shouldBePrivateByDefault( { notFlowName: 'really' } ) ).toBe( true );
	} );

	test( 'should return `true` for onboarding flow', () => {
		expect( shouldBePrivateByDefault( { flowName: 'onboarding' } ) ).toBe( true );
	} );

	test( 'should return `false` for ecommerce flow', () => {
		expect( shouldBePrivateByDefault( { flowName: 'ecommerce' } ) ).toBe( false );
	} );

	test( 'should return `false` for ecommerce-onboarding flow', () => {
		expect( shouldBePrivateByDefault( { flowName: 'ecommerce-onboarding' } ) ).toBe( false );
	} );

	test( 'should use lastKnownFlow if flowName is missing', () => {
		expect( shouldBePrivateByDefault( { lastKnownFlow: 'ecommerce' } ) ).toBe( false );
	} );

	test( 'flowName takes precedence over lastKnownFlow', () => {
		expect(
			shouldBePrivateByDefault( { flowName: 'onboarding', lastKnownFlow: 'ecommerce' } )
		).toBe( true );
	} );
} );
