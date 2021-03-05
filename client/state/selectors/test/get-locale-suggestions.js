/**
 * Internal dependencies
 */
import getLocaleSuggestions from 'calypso/state/selectors/get-locale-suggestions';

describe( 'getLocaleSuggestions()', () => {
	test( 'should return null if no items found', () => {
		const suggestedLocales = getLocaleSuggestions( {
			i18n: {},
		} );

		expect( suggestedLocales ).toBe( null );
	} );

	test( 'should return the suggested locales', () => {
		const suggestedLocales = getLocaleSuggestions( {
			i18n: {
				localeSuggestions: [ 'Phwoar!' ],
			},
		} );

		expect( suggestedLocales ).toEqual( [ 'Phwoar!' ] );
	} );
} );
