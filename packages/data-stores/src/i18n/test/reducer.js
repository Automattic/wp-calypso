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

		it( 'should overwrite the existing locale', () => {
			const localizedLanguageNames = Symbol( 'localizedLanguageNames' );
			const locale = 'fake-locale';

			const action = setLocalizedLanguageNames( locale, localizedLanguageNames );

			const state = reducer(
				{ localizedLanguageNames: { [ locale ]: Symbol( 'previous localizedLanguageNames' ) } },
				action
			);

			expect( state ).toEqual( {
				localizedLanguageNames: {
					[ locale ]: localizedLanguageNames,
				},
			} );
		} );

		it( 'should add the new locale without overwriting the old one', () => {
			const localizedLanguageNames = Symbol( 'localizedLanguageNames' );
			const locale = 'fake-locale';
			const anotherLocale = 'another-locale';
			const anotherLocalesLocalizedLanguageNames = Symbol( 'another localizedLanguageNames' );

			const action = setLocalizedLanguageNames( locale, localizedLanguageNames );

			const state = reducer(
				{
					localizedLanguageNames: {
						[ anotherLocale ]: anotherLocalesLocalizedLanguageNames,
					},
				},
				action
			);

			expect( state ).toEqual( {
				localizedLanguageNames: {
					[ locale ]: localizedLanguageNames,
					[ anotherLocale ]: anotherLocalesLocalizedLanguageNames,
				},
			} );
		} );
	} );
} );
