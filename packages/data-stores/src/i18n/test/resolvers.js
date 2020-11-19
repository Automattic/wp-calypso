/**
 * Internal dependencies
 */
import { getLocalizedLanguageNames } from '../resolvers';
import { setLocalizedLanguageNames } from '../actions';

describe( 'i18n resolvers', () => {
	describe( 'getLocalizedLanguageNames', () => {
		it( 'should set the localized language names', () => {
			const iter = getLocalizedLanguageNames( 'en-us' );

			expect( iter.next().value ).toEqual( {
				type: 'API_FETCH',
				request: expect.objectContaining( {
					mode: 'cors',
					url: expect.stringContaining( 'language-names?_locale=en-us' ),
				} ),
			} );

			const localizedLanguageNames = Symbol( 'localizedLanguageNames' );

			expect( iter.next( localizedLanguageNames ).value ).toEqual(
				setLocalizedLanguageNames( 'en-us', localizedLanguageNames )
			);
		} );
	} );
} );
