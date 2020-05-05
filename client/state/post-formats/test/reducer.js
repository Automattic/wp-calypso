/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { requesting, items } from '../reducer';
import {
	POST_FORMATS_RECEIVE,
	POST_FORMATS_REQUEST,
	POST_FORMATS_REQUEST_FAILURE,
	POST_FORMATS_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';
import { useSandbox } from 'test/helpers/use-sinon';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [ 'requesting', 'items' ] );
	} );

	describe( '#requesting()', () => {
		test( 'should default to an empty object', () => {
			const state = requesting( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should set site ID to true value if a request is initiated', () => {
			const state = requesting( undefined, {
				type: POST_FORMATS_REQUEST,
				siteId: 12345678,
			} );

			expect( state ).to.eql( {
				12345678: true,
			} );
		} );

		test( 'should accumulate the requested site IDs', () => {
			const state = requesting(
				deepFreeze( {
					12345678: true,
				} ),
				{
					type: POST_FORMATS_REQUEST,
					siteId: 87654321,
				}
			);

			expect( state ).to.eql( {
				12345678: true,
				87654321: true,
			} );
		} );

		test( 'should set site ID to false if request finishes successfully', () => {
			const state = requesting(
				deepFreeze( {
					12345678: true,
				} ),
				{
					type: POST_FORMATS_REQUEST_SUCCESS,
					siteId: 12345678,
				}
			);

			expect( state ).to.eql( {
				12345678: false,
			} );
		} );

		test( 'should set site ID to false if request finishes unsuccessfully', () => {
			const state = requesting(
				deepFreeze( {
					12345678: true,
				} ),
				{
					type: POST_FORMATS_REQUEST_FAILURE,
					siteId: 12345678,
				}
			);

			expect( state ).to.eql( {
				12345678: false,
			} );
		} );

		test( 'should not persist state', () => {
			const state = requesting(
				deepFreeze( {
					12345678: true,
				} ),
				{
					type: SERIALIZE,
				}
			);

			expect( state ).to.be.undefined;
		} );

		test( 'should not load persisted state', () => {
			const state = requesting(
				deepFreeze( {
					12345678: true,
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#items()', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should index post formats by site ID', () => {
			const state = items( null, {
				type: POST_FORMATS_RECEIVE,
				siteId: 12345678,
				formats: {
					image: 'Image',
					video: 'Video',
					link: 'Link',
				},
			} );

			expect( state ).to.eql( {
				12345678: {
					image: 'Image',
					video: 'Video',
					link: 'Link',
				},
			} );
		} );

		test( 'should accumulate sites', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						image: 'Image',
						video: 'Video',
						link: 'Link',
					},
				} ),
				{
					type: POST_FORMATS_RECEIVE,
					siteId: 87654321,
					formats: {
						status: 'Status',
					},
				}
			);

			expect( state ).to.eql( {
				12345678: {
					image: 'Image',
					video: 'Video',
					link: 'Link',
				},
				87654321: {
					status: 'Status',
				},
			} );
		} );

		test( 'should override previous post formats of same site ID', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						image: 'Image',
						video: 'Video',
						link: 'Link',
					},
				} ),
				{
					type: POST_FORMATS_RECEIVE,
					siteId: 12345678,
					formats: {
						status: 'Status',
					},
				}
			);

			expect( state ).to.eql( {
				12345678: {
					status: 'Status',
				},
			} );
		} );

		test( 'should persist state', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						status: 'Status',
					},
				} ),
				{
					type: SERIALIZE,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					status: 'Status',
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						status: 'Status',
					},
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					status: 'Status',
				},
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = items(
				deepFreeze( {
					status: 'Status',
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( {} );
		} );
	} );
} );
