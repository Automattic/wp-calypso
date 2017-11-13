/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { requesting, revisions } from '../reducer';
import {
	POST_REVISIONS_RECEIVE,
	POST_REVISIONS_REQUEST,
	POST_REVISIONS_REQUEST_FAILURE,
	POST_REVISIONS_REQUEST_SUCCESS,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'requesting',
			'revisions',
			// @TODO add selection & ui tests
			'selection',
			'ui',
		] );
	} );

	describe( '#requesting', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set to `true` if a request is initiated', () => {
			const state = requesting( undefined, {
				type: POST_REVISIONS_REQUEST,
				siteId: 12345678,
				postId: 50,
			} );

			expect( state ).to.eql( {
				12345678: {
					50: true,
				},
			} );
		} );

		test( 'should set to `false` if the request is successful', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_REVISIONS_REQUEST_SUCCESS,
					siteId: 12345678,
					postId: 50,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: false,
				},
			} );
		} );

		test( 'should set to `false` if the request fails', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_REVISIONS_REQUEST_FAILURE,
					siteId: 12345678,
					postId: 50,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: false,
				},
			} );
		} );

		test( 'should support multiple sites', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_REVISIONS_REQUEST,
					siteId: 87654321,
					postId: 10,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: true,
				},
				87654321: {
					10: true,
				},
			} );
		} );

		test( 'should support multiple posts', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						50: true,
					},
				} ),
				{
					type: POST_REVISIONS_REQUEST,
					siteId: 12345678,
					postId: 10,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: true,
					10: true,
				},
			} );
		} );
	} );

	describe( '#revisions', () => {
		test( 'should default to an empty object', () => {
			const state = revisions( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should support multiple sites', () => {
			const state = revisions(
				deepFreeze( {
					12345678: {
						50: {
							51: {
								id: 51,
							},
						},
					},
				} ),
				{
					type: POST_REVISIONS_RECEIVE,
					siteId: 87654321,
					postId: 10,
					revisions: [
						{
							id: 11,
						},
					],
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: {
						51: {
							id: 51,
						},
					},
				},
				87654321: {
					10: {
						11: {
							id: 11,
						},
					},
				},
			} );
		} );

		test( 'should support multiple posts', () => {
			const state = revisions(
				deepFreeze( {
					12345678: {
						50: {
							51: {
								id: 51,
							},
						},
					},
				} ),
				{
					type: POST_REVISIONS_RECEIVE,
					siteId: 12345678,
					postId: 10,
					revisions: [
						{
							id: 11,
						},
					],
				}
			);

			expect( state ).to.eql( {
				12345678: {
					50: {
						51: {
							id: 51,
						},
					},
					10: {
						11: {
							id: 11,
						},
					},
				},
			} );
		} );

		test( 'should discard previous revisions for the same post', () => {
			const state = revisions(
				deepFreeze( {
					12345678: {
						10: {
							51: {
								id: 51,
							},
						},
					},
				} ),
				{
					type: POST_REVISIONS_RECEIVE,
					siteId: 12345678,
					postId: 10,
					revisions: [
						{
							id: 52,
						},
					],
				}
			);

			expect( state ).to.eql( {
				12345678: {
					10: {
						52: {
							id: 52,
						},
					},
				},
			} );
		} );
	} );
} );
