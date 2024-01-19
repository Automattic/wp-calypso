import { isLockedStyleVariation } from '../is-locked-style-variation';

describe( 'isLockedStyleVariation', () => {
	it( 'should return true when shouldLimitGlobalStyles is true, theme is not premium, and selectedStyleVariationSlug is not default', () => {
		const isPremium = false;
		const selectedStyleVariationSlug = 'ember';
		const shouldLimitGlobalStyles = true;

		const result = isLockedStyleVariation( {
			isPremium,
			selectedStyleVariationSlug,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( true );
	} );

	it( 'should return false when shouldLimitGlobalStyles is false', () => {
		const isPremium = false;
		const selectedStyleVariationSlug = 'ember';
		const shouldLimitGlobalStyles = false;

		const result = isLockedStyleVariation( {
			isPremium,
			selectedStyleVariationSlug,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( false );
	} );

	it( 'should return false when theme is premium', () => {
		const isPremium = true;
		const selectedStyleVariationSlug = undefined;
		const shouldLimitGlobalStyles = true;

		const result = isLockedStyleVariation( {
			isPremium,
			selectedStyleVariationSlug,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( false );
	} );

	it( 'should return false when selectedStyleVariationSlug is default', () => {
		const isPremium = false;
		const selectedStyleVariationSlug = 'default';
		const shouldLimitGlobalStyles = true;

		const result = isLockedStyleVariation( {
			isPremium,
			selectedStyleVariationSlug,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( false );
	} );
} );
