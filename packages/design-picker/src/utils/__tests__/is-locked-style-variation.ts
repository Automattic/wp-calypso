import { isLockedStyleVariation } from '../is-locked-style-variation';
import { defaultStyleVariation } from './fixtures/default-style-variation';
import { nonDefaultStyleVariation } from './fixtures/non-default-style-variation';
import { nonPremiumDesign } from './fixtures/non-premium-design';
import { premiumDesign } from './fixtures/premium-design';

describe( 'isLockedStyleVariation', () => {
	it( 'should return true when shouldLimitGlobalStyles is true, design is not premium, and selectedStyleVariation is not a default global styles variation slug', () => {
		const design = nonPremiumDesign;
		const selectedStyleVariation = nonDefaultStyleVariation;
		const shouldLimitGlobalStyles = true;

		const result = isLockedStyleVariation( {
			design,
			selectedStyleVariation,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( true );
	} );

	it( 'should return false when shouldLimitGlobalStyles is false', () => {
		const design = nonPremiumDesign;
		const selectedStyleVariation = nonDefaultStyleVariation;
		const shouldLimitGlobalStyles = false;

		const result = isLockedStyleVariation( {
			design,
			selectedStyleVariation,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( false );
	} );

	it( 'should return false when design is premium', () => {
		const design = premiumDesign;
		const selectedStyleVariation = undefined;
		const shouldLimitGlobalStyles = true;

		const result = isLockedStyleVariation( {
			design,
			selectedStyleVariation,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( false );
	} );

	it( 'should return false when selectedStyleVariation is a default global styles variation slug', () => {
		const design = nonPremiumDesign;
		const selectedStyleVariation = defaultStyleVariation;
		const shouldLimitGlobalStyles = true;

		const result = isLockedStyleVariation( {
			design,
			selectedStyleVariation,
			shouldLimitGlobalStyles,
		} );

		expect( result ).toBe( false );
	} );
} );
