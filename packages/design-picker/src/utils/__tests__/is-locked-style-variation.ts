import { isLockedStyleVariation } from '../is-locked-style-variation';

describe( 'isLockedStyleVariation', () => {
	it( 'should return true when shouldLimitGlobalStyles is true, theme is not premium, and styleVariationSlug is not default', () => {
		const isPremiumTheme = false;
		const styleVariationSlug = 'ember';
		const shouldLimitGlobalStyles = true;

		const result = isLockedStyleVariation( {
			isPremiumTheme,
			styleVariationSlug,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( true );
	} );

	it( 'should return false when shouldLimitGlobalStyles is false', () => {
		const isPremiumTheme = false;
		const styleVariationSlug = 'ember';
		const shouldLimitGlobalStyles = false;

		const result = isLockedStyleVariation( {
			isPremiumTheme,
			styleVariationSlug,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( false );
	} );

	it( 'should return false when theme is premium', () => {
		const isPremiumTheme = true;
		const styleVariationSlug = undefined;
		const shouldLimitGlobalStyles = true;

		const result = isLockedStyleVariation( {
			isPremiumTheme,
			styleVariationSlug,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( false );
	} );

	it( 'should return false when styleVariationSlug is default', () => {
		const isPremiumTheme = false;
		const styleVariationSlug = 'default';
		const shouldLimitGlobalStyles = true;

		const result = isLockedStyleVariation( {
			isPremiumTheme,
			styleVariationSlug,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( false );
	} );
} );
