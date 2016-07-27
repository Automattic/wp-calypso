/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { EDITOR_TERM_ADDED_SET, TERMS_RECEIVE } from 'state/action-types';
import reducer, { added } from '../reducer';

describe( 'reducer', () => {
	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'added'
		] );
	} );

	describe( '#added()', () => {
		it( 'should default to null', () => {
			const state = added( undefined, {} );

			expect( state ).to.be.null;
		} );

		it( 'should track last added term site, post, taxonomy combo via TERMS_RECEIVE', () => {
			const state = added( undefined, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				postId: 841,
				taxonomy: 'category',
				terms: [ {
					ID: 111,
					name: 'A term of amazement'
				} ]
			} );

			expect( state ).to.eql( {
				2916284: {
					841: {
						category: 111
					}
				}
			} );
		} );

		it( 'should ignore TERMS_RECEIVE without a postId', () => {
			const state = added( undefined, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				taxonomy: 'category',
				terms: [ {
					ID: 111,
					name: 'A term of amazement'
				} ]
			} );

			expect( state ).to.be.null;
		} );

		it( 'should set term site, post, taxonomy combo', () => {
			const state = added( undefined, {
				type: EDITOR_TERM_ADDED_SET,
				siteId: 2916284,
				postId: 841,
				taxonomy: 'category',
				termId: null
			} );

			expect( state ).to.eql( {
				2916284: {
					841: {
						category: null
					}
				}
			} );
		} );
	} );
} );
