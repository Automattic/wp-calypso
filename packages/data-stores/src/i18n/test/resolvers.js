/**
 * External dependencies
 */
import { apiFetch } from '@wordpress/data-controls';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import { getLocalizedLanguageNames } from '../resolvers';
import { setLocalizedLanguageNames } from '../actions';
import { LANGUAGE_NAMES_URL } from '../constants';

describe( 'i18n resolvers', () => {
	describe( 'getLocalizedLanguageNames', () => {
		it( 'should set the localized language names', () => {
			const iter = getLocalizedLanguageNames( 'en-us' );

			expect( iter.next().value ).toEqual(
				apiFetch( {
					url: addQueryArgs( LANGUAGE_NAMES_URL, { _locale: 'en-us' } ),
					mode: 'cors',
				} )
			);

			const localizedLanguageNames = Symbol( 'localizedLanguageNames' );

			expect( iter.next( localizedLanguageNames ).value ).toEqual(
				setLocalizedLanguageNames( 'en-us', localizedLanguageNames )
			);

			expect( iter.next().done ).toBeTruthy();
		} );
	} );
} );
