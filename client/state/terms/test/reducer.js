/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import keyBy from 'lodash/keyBy';
import merge from 'lodash/merge';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	DESERIALIZE,
	TERMS_RECEIVE,
	TERMS_REQUEST,
	TERMS_REQUEST_FAILURE,
	TERMS_REQUEST_SUCCESS,
	SERIALIZE
} from 'state/action-types';
import reducer, {
	items,
	requesting
} from '../reducer';

/**
 * Test Data
 */
const testTerms = [
	{ ID: 111, name: 'Chicken', slug: 'chicken', description: 'cornel sanders', post_count: 1, parent: 0 },
	{ ID: 123, name: 'Ribs', slug: 'ribs', description: 'i want my baby back * 3 ribs', post_count: 100, parent: 0 },
];
const keyedTestTerms = keyBy( testTerms, 'ID' );

const moreTerms = [
	{ ID: 99, name: 'Amazing', slug: 'amazing', description: 'an amazing term', post_count: 1, parent: 0 },
	{ ID: 100, name: 'Term', slug: 'term', description: 'a term about terms', post_count: 100, parent: 0 },
];

const keyedMoreTerms = keyBy( moreTerms, 'ID' );

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'requesting'
		] );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track request fetching', () => {
			const state = requesting( undefined, {
				type: TERMS_REQUEST,
				siteId: 2916284,
				taxonomy: 'category'
			} );

			expect( state ).to.eql( {
				2916284: {
					category: true
				}
			} );
		} );

		it( 'should accumulate requests for the same site', () => {
			const original = deepFreeze( {
				2916284: {
					category: true
				}
			} );
			const state = requesting( original, {
				type: TERMS_REQUEST,
				siteId: 2916284,
				taxonomy: 'some-taxonomy'
			} );

			expect( state ).to.eql( {
				2916284: {
					category: true,
					'some-taxonomy': true
				}
			} );
		} );

		it( 'should accumulate requests for distinct sites', () => {
			const original = deepFreeze( {
				2916284: {
					category: true,
					'some-taxonomy': true
				}
			} );
			const state = requesting( original, {
				type: TERMS_REQUEST,
				siteId: 77203074,
				taxonomy: 'some-taxonomy'
			} );

			expect( state ).to.eql( {
				2916284: {
					category: true,
					'some-taxonomy': true
				},
				77203074: {
					'some-taxonomy': true
				}
			} );
		} );

		it( 'should track request success', () => {
			const original = deepFreeze( {
				2916284: {
					category: true,
					'some-taxonomy': true
				},
				77203074: {
					category: true
				}
			} );
			const state = requesting( original, {
				type: TERMS_REQUEST_SUCCESS,
				siteId: 2916284,
				taxonomy: 'category'
			} );

			expect( state ).to.eql( {
				2916284: {
					category: false,
					'some-taxonomy': true
				},
				77203074: {
					category: true
				}
			} );
		} );

		it( 'should track request failure', () => {
			const original = deepFreeze( {
				2916284: {
					category: false,
					'some-taxonomy': true
				},
				77203074: {
					category: true
				}
			} );
			const state = requesting( original, {
				type: TERMS_REQUEST_FAILURE,
				siteId: 2916284,
				taxonomy: 'some-taxonomy'
			} );

			expect( state ).to.eql( {
				2916284: {
					category: false,
					'some-taxonomy': false
				},
				77203074: {
					category: true
				}
			} );
		} );

		it( 'should never persist state', () => {
			const original = deepFreeze( {
				2916284: {
					category: false
				},
				77203074: {
					category: true
				}
			} );
			const state = requesting( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					category: false
				},
				77203074: {
					category: true
				}
			} );
			const state = requesting( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#items()', () => {
		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': {
						111: {}
					}
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should add received terms', () => {
			const state = items( undefined, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				taxonomy: 'jetpack-portfolio',
				terms: testTerms
			} );

			expect( state ).to.eql( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );
		} );

		it( 'should accumulate received terms by taxonomy', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );

			const state = items( original, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				taxonomy: 'jetpack-portfolio',
				terms: moreTerms
			} );

			const expectedTerms = merge( {}, keyedTestTerms, keyedMoreTerms );

			expect( state ).to.eql( {
				2916284: {
					'jetpack-portfolio': expectedTerms
				}
			} );
		} );

		it( 'should add additional terms', () => {
			const original = deepFreeze( {
				2916284: {
					'jetpack-portfolio': keyedTestTerms
				}
			} );

			const state = items( original, {
				type: TERMS_RECEIVE,
				siteId: 2916284,
				taxonomy: 'amazing-taxonomy',
				terms: moreTerms
			} );

			expect( state ).to.eql( {
				2916284: {
					'amazing-taxonomy': keyedMoreTerms,
					'jetpack-portfolio': keyedTestTerms
				}
			} );
		} );
	} );
} );
