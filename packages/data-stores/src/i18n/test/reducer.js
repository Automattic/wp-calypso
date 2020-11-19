/**
 * Internal dependencies
 */
import reducer from '../reducer';
import { setLocalizedLanguageNames } from '../actions';

describe( 'i18n reducer', () => {
	describe( 'localizedLanguageNames', () => {
		it( 'should default to no localized language names', () => {
			const { localizedLanguageNames } = reducer( undefined, { type: '' } );
			expect( localizedLanguageNames ).toEqual( {} );
		} );

		it( 'should set the localized language names', () => {
			const localizedLanguageNames = Symbol( 'localizedLanguageNames' );
			const locale = 'fake-locale';

			const action = setLocalizedLanguageNames( locale, localizedLanguageNames );

			const state = reducer( undefined, action );

			expect( state ).toEqual( {
				localizedLanguageNames: {
					[ locale ]: localizedLanguageNames,
				},
			} );
		} );
	} );
} );
