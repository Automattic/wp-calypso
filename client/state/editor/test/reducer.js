/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	EDITOR_POST_EDIT,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import { posts } from '../reducer';

describe( 'reducer', () => {
	describe( '#posts()', () => {
		it( 'should default to an empty object', () => {
			const state = posts( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track new post draft revisions by site ID', () => {
			const state = posts( undefined, {
				type: EDITOR_POST_EDIT,
				siteId: 2916284,
				post: { title: 'Ribs & Chicken' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} );
		} );

		it( 'should track existing post revisions by site ID, post ID', () => {
			const state = posts( undefined, {
				type: EDITOR_POST_EDIT,
				siteId: 2916284,
				postId: 841,
				post: { title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				2916284: {
					841: {
						title: 'Hello World'
					}
				}
			} );
		} );

		it( 'should accumulate posts', () => {
			const state = posts( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), {
				type: EDITOR_POST_EDIT,
				siteId: 2916284,
				postId: 841,
				post: { title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					},
					841: {
						title: 'Hello World'
					}
				}
			} );
		} );

		it( 'should accumulate sites', () => {
			const state = posts( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), {
				type: EDITOR_POST_EDIT,
				siteId: 77203074,
				postId: 841,
				post: { title: 'Hello World' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				},
				77203074: {
					841: {
						title: 'Hello World'
					}
				}
			} );
		} );

		it( 'should merge post revisions', () => {
			const state = posts( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), {
				type: EDITOR_POST_EDIT,
				siteId: 2916284,
				post: { content: 'Delicious.' }
			} );

			expect( state ).to.eql( {
				2916284: {
					'': {
						title: 'Ribs & Chicken',
						content: 'Delicious.'
					}
				}
			} );
		} );

		it( 'should not persist state', () => {
			const state = posts( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = posts( deepFreeze( {
				2916284: {
					'': {
						title: 'Ribs & Chicken'
					}
				}
			} ), { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
