import { getSuggestionsVendor } from '../index';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn( () => false ),
} ) );

jest.mock( '@automattic/onboarding', () => ( {
	isDomainForGravatarFlow: jest.fn( () => false ),
	isHundredYearPlanFlow: jest.fn( () => false ),
	isHundredYearDomainFlow: jest.fn( () => false ),
	isNewsletterFlow: jest.fn( () => false ),
} ) );

describe( 'getSuggestionsVendor', () => {
	test( 'should return ciab when isCiab is true', () => {
		expect( getSuggestionsVendor( { isCiab: true } ) ).toBe( 'ciab' );
	} );

	test( 'should return ciab for isCiab regardless of other options', () => {
		expect(
			getSuggestionsVendor( {
				isCiab: true,
				isSignup: true,
				isDomainOnly: false,
				isPremium: true,
				flowName: 'domain',
			} )
		).toBe( 'ciab' );
	} );

	test( 'should not return ciab when isCiab is false', () => {
		expect( getSuggestionsVendor( { isCiab: false } ) ).not.toBe( 'ciab' );
	} );

	test( 'should return ecommerce when isWooHostingSolutions is true', () => {
		expect( getSuggestionsVendor( { isWooHostingSolutions: true } ) ).toBe( 'ecommerce' );
	} );

	test( 'should return ecommerce regardless of other flags when isWooHostingSolutions is true', () => {
		expect(
			getSuggestionsVendor( {
				isWooHostingSolutions: true,
				isSignup: true,
				isDomainOnly: false,
				isPremium: true,
				flowName: 'onboarding',
			} )
		).toBe( 'ecommerce' );
	} );

	test( 'should prefer ciab over ecommerce when both flags are set', () => {
		// CIAB has its own dedicated vendor and takes precedence.
		expect( getSuggestionsVendor( { isCiab: true, isWooHostingSolutions: true } ) ).toBe( 'ciab' );
	} );

	test( 'should not return ecommerce when isWooHostingSolutions is false', () => {
		expect( getSuggestionsVendor( { isWooHostingSolutions: false } ) ).not.toBe( 'ecommerce' );
	} );
} );
