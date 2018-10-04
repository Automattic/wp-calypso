/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { setLocale, setLocaleRawData } from '../actions';
import { LOCALE_SET } from 'state/action-types';

describe( 'actions', () => {
	describe( 'setLocale', () => {
		test( 'returns an appropriate action', () => {
			expect( setLocale( 'he' ) ).to.eql( {
				type: LOCALE_SET,
				localeSlug: 'he',
				localeVariant: null,
			} );
		} );

		test( 'returns an action with localeVariant set', () => {
			expect( setLocale( 'he', 'he_formal' ) ).to.eql( {
				type: LOCALE_SET,
				localeSlug: 'he',
				localeVariant: 'he_formal',
			} );
		} );
	} );

	describe( 'setLocaleRawData', () => {
		test( 'returns an appropriate action', () => {
			expect(
				setLocaleRawData( {
					'': {
						localeSlug: 'he',
					},
				} )
			).to.eql( {
				type: LOCALE_SET,
				localeSlug: 'he',
				localeVariant: null,
			} );
		} );

		test( 'returns an action with localeVariant set', () => {
			expect(
				setLocaleRawData( {
					'': {
						localeSlug: 'he',
						localeVariant: 'he_formal',
					},
				} )
			).to.eql( {
				type: LOCALE_SET,
				localeSlug: 'he',
				localeVariant: 'he_formal',
			} );
		} );
	} );
} );
