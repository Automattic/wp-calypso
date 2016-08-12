/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isSiteWordadsUnsafe,
	isRequestingWordadsStatus
} from '../selectors';

describe( 'selectors', () => {
	const state = {
		wordads: {
			status: {
				items: {
					2916284: {
						unsafe: 'mature',
						active: true
					},
					77203074: {}
				},
				fetchingItems: {
					2916284: true,
					77203074: false
				}
			}
		}
	};
	describe( '#isSiteWordadsUnsafe()', () => {
		it( 'should return status value for a given site ID', () => {
			expect( isSiteWordadsUnsafe( state, 2916284 ) ).to.eql( 'mature' );
		} );
		it( 'should return false when sticker absent', () => {
			expect( isSiteWordadsUnsafe( state, 77203074 ) ).to.eql( false );
		} );
		it( 'should return false when site absent', () => {
			expect( isSiteWordadsUnsafe( state, 123 ) ).to.eql( false );
		} );
	} );

	describe( '#isRequestingWordadsStatus()', () => {
		it( 'should return fetching value for a site ID', () => {
			expect( isRequestingWordadsStatus( state, 2916284 ) ).to.eql( true );
			expect( isRequestingWordadsStatus( state, 77203074 ) ).to.eql( false );

		} );
		it( 'should return false when site ID value is absent', () => {
			expect( isRequestingWordadsStatus( state, 12345 ) ).to.eql( false );
		} );
	} );
} );
