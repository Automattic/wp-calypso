/** @format */

/**
 * Internal dependencies
 */
import { getLocaleSuggestions } from 'state/selectors';

describe( 'getLocaleSuggestions()', () => {
	test( 'should return null if no items found', () => {
		const suggestedLocales = getLocaleSuggestions( {
			i18n: {
				localeSuggestions: {},
			},
		} );

		expect( suggestedLocales ).toBe( null );
	} );

	test( 'should return the suggested locales', () => {
		const suggestedLocales = getLocaleSuggestions( {
			i18n: {
				localeSuggestions: {
					items: [ 'Phwoar!' ],
				},
			},
		} );

		expect( suggestedLocales ).toEqual( [ 'Phwoar!' ] );
	} );
} );
