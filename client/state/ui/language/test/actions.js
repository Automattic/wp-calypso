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
		it( 'returns a promise', () => {
			const setLocaleResult = setLocale( 'he' )( a => a );
			expect( setLocaleResult.then ).to.be.a.function;
		} );

		it( 'dispatches a locale', done => {
			setLocale( 'he' )( ( data ) => {
				expect( data.localeSlug ).to.eql( 'he' );
			} ).then( done, done );
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
