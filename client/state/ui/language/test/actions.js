/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { LOCALE_SET } from 'state/action-types';
import { setLocale, setLocaleRawData } from '../actions';

describe( 'actions', () => {
	describe( 'setLocale', () => {
		it( 'returns an appropriate action', () => {
			expect( setLocale( 'he' ) ).to.eql( {
				type: LOCALE_SET,
				localeSlug: 'he'
			} );
		} );
	} );

	describe( 'setLocaleRawData', () => {
		it( 'returns an appropriate action', () => {
			expect( setLocaleRawData( {
				'': {
					localeSlug: 'he'
				}
			} ) ).to.eql( {
				type: LOCALE_SET,
				localeSlug: 'he'
			} );
		} );
	} );
} );
