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

	test( 'should not return ecommerce when isWooHostingSolutions is false', () => {
		expect( getSuggestionsVendor( { isWooHostingSolutions: false } ) ).not.toBe( 'ecommerce' );
	} );
} );
