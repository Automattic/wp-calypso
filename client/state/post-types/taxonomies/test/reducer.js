/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	POST_TYPES_TAXONOMIES_RECEIVE,
	POST_TYPES_TAXONOMIES_REQUEST,
	POST_TYPES_TAXONOMIES_REQUEST_SUCCESS,
	POST_TYPES_TAXONOMIES_REQUEST_FAILURE,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, {
	requesting,
	items
} from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'items'
		] );
	} );

	describe( '#requesting()', () => {
		it( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track request fetching', () => {
			const state = requesting( undefined, {
				type: POST_TYPES_TAXONOMIES_REQUEST,
				siteId: 2916284,
				postType: 'post'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: true
				}
			} );
		} );

		it( 'should accumulate requests for the same site', () => {
			const original = deepFreeze( {
				2916284: {
					post: true
				}
			} );
			const state = requesting( original, {
				type: POST_TYPES_TAXONOMIES_REQUEST,
				siteId: 2916284,
				postType: 'page'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: true,
					page: true
				}
			} );
		} );

		it( 'should accumulate requests for distinct sites', () => {
			const original = deepFreeze( {
				2916284: {
					post: true,
					page: true
				}
			} );
			const state = requesting( original, {
				type: POST_TYPES_TAXONOMIES_REQUEST,
				siteId: 77203074,
				postType: 'post'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: true,
					page: true
				},
				77203074: {
					post: true
				}
			} );
		} );

		it( 'should track request success', () => {
			const original = deepFreeze( {
				2916284: {
					post: true,
					page: true
				},
				77203074: {
					post: true
				}
			} );
			const state = requesting( original, {
				type: POST_TYPES_TAXONOMIES_REQUEST_SUCCESS,
				siteId: 2916284,
				postType: 'post'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: false,
					page: true
				},
				77203074: {
					post: true
				}
			} );
		} );

		it( 'should track request failure', () => {
			const original = deepFreeze( {
				2916284: {
					post: false,
					page: true
				},
				77203074: {
					post: true
				}
			} );
			const state = requesting( original, {
				type: POST_TYPES_TAXONOMIES_REQUEST_FAILURE,
				siteId: 2916284,
				postType: 'page'
			} );

			expect( state ).to.eql( {
				2916284: {
					post: false,
					page: false
				},
				77203074: {
					post: true
				}
			} );
		} );

		it( 'should never persist state', () => {
			const original = deepFreeze( {
				2916284: {
					post: false,
					page: false
				},
				77203074: {
					post: true
				}
			} );
			const state = requesting( original, { type: SERIALIZE } );

			expect( state ).to.eql( {} );
		} );

		it( 'should never load persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					post: false,
					page: false
				},
				77203074: {
					post: true
				}
			} );
			const state = requesting( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#items()', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should track received post items by type, keyed by name', () => {
			const state = items( undefined, {
				type: POST_TYPES_TAXONOMIES_RECEIVE,
				siteId: 2916284,
				postType: 'post',
				taxonomies: [
					{ name: 'category', label: 'Categories' },
					{ name: 'post_tag', label: 'Tags' }
				]
			} );

			expect( state ).to.eql( {
				2916284: {
					post: {
						category: {
							name: 'category',
							label: 'Categories'
						},
						post_tag: {
							name: 'post_tag',
							label: 'Tags'
						}
					}
				}
			} );
		} );

		it( 'should persist state', () => {
			const original = deepFreeze( {
				2916284: {
					post: {
						category: {
							name: 'category',
							label: 'Categories'
						},
						post_tag: {
							name: 'post_tag',
							label: 'Tags'
						}
					}
				}
			} );
			const state = items( original, { type: SERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should load valid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					post: {
						category: {
							name: 'category',
							label: 'Categories'
						},
						post_tag: {
							name: 'post_tag',
							label: 'Tags'
						}
					}
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( original );
		} );

		it( 'should not load invalid persisted state', () => {
			const original = deepFreeze( {
				2916284: {
					post: {
						category: true
					}
				}
			} );
			const state = items( original, { type: DESERIALIZE } );

			expect( state ).to.eql( {} );
		} );
	} );
} );
