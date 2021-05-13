/**
 * Internal dependencies
 */
import { getLocalizedLanguageNames } from '../selectors';

describe( 'i18n selectors', () => {
	describe( 'getLocalizedLanguageNames', () => {
		it( 'should retrieve the localized language names for the locale', () => {
			const localizedLanguageNames = Symbol( 'localizedLanguageNames en-us' );
			const state = {
				localizedLanguageNames: {
					'en-us': localizedLanguageNames,
				},
			};

			expect( getLocalizedLanguageNames( state, 'en-us' ) ).toBe( localizedLanguageNames );
		} );

		it( 'should return undefined if the locale is not set', () => {
			const state = {};

			expect( getLocalizedLanguageNames( state, 'en-us' ) ).toBeUndefined();
		} );
	} );
} );
