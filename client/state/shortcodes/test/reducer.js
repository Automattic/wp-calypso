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
	SHORTCODE_RECEIVE,
	SHORTCODE_REQUEST,
	SHORTCODE_REQUEST_FAILURE,
	SHORTCODE_REQUEST_SUCCESS,
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

		test( 'should set shortcode of that site ID to true value if a request is initiated', () => {
			const state = requesting(
				{},
				{
					type: SHORTCODE_REQUEST,
					siteId: 12345678,
					shortcode: 'test_shortcode',
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: true,
				},
			} );
		} );

		test( 'should store the requested site IDs faultlessly if the site previously had no shortcodes', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {},
				} ),
				{
					type: SHORTCODE_REQUEST,
					siteId: 12345678,
					shortcode: 'another_shortcode',
				}
			);

			expect( state ).to.eql( {
				12345678: {
					another_shortcode: true,
				},
			} );
		} );

		test( 'should accumulate the requested site IDs', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						test_shortcode: true,
					},
				} ),
				{
					type: SHORTCODE_REQUEST,
					siteId: 87654321,
					shortcode: 'another_shortcode',
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: true,
				},
				87654321: {
					another_shortcode: true,
				},
			} );
		} );

		test( 'should accumulate the requested shortcodes of given site IDs', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						test_shortcode: false,
					},
					87654321: {
						another_shortcode: true,
					},
				} ),
				{
					type: SHORTCODE_REQUEST,
					siteId: 12345678,
					shortcode: 'some_shortcode',
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: false,
					some_shortcode: true,
				},
				87654321: {
					another_shortcode: true,
				},
			} );
		} );

		test( 'should set shortcode of that site ID to false if request finishes successfully', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						test_shortcode: true,
						another_shortcode: true,
					},
					87654321: {
						test_shortcode: true,
					},
				} ),
				{
					type: SHORTCODE_REQUEST_SUCCESS,
					siteId: 12345678,
					shortcode: 'test_shortcode',
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: false,
					another_shortcode: true,
				},
				87654321: {
					test_shortcode: true,
				},
			} );
		} );

		test( 'should set shortcode of that site ID to false if request finishes unsuccessfully', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						test_shortcode: true,
						another_shortcode: true,
					},
					87654321: {
						test_shortcode: true,
					},
				} ),
				{
					type: SHORTCODE_REQUEST_FAILURE,
					siteId: 12345678,
					shortcode: 'test_shortcode',
					error: 'The requested shortcode does not exist.',
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: false,
					another_shortcode: true,
				},
				87654321: {
					test_shortcode: true,
				},
			} );
		} );

		test( 'should not persist state', () => {
			const state = requesting(
				deepFreeze( {
					12345678: {
						test_shortcode: true,
					},
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
					12345678: {
						test_shortcode: true,
					},
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#items()', () => {
		const shortcodeData = {
			result: '<html></html>',
			shortcode: '[gallery ids="1,2,3"]',
			scripts: {},
			styles: {},
		};

		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		test( 'should index shortcodes by site ID', () => {
			const state = items(
				{},
				{
					type: SHORTCODE_RECEIVE,
					siteId: 12345678,
					shortcode: 'test_shortcode',
					data: shortcodeData,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
				},
			} );
		} );

		test( 'should index shortcodes by site ID faultlessly if the site previously had no shortcodes', () => {
			const state = items(
				{
					12345678: {},
				},
				{
					type: SHORTCODE_RECEIVE,
					siteId: 12345678,
					shortcode: 'test_shortcode',
					data: shortcodeData,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
				},
			} );
		} );

		test( 'should accumulate sites', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						test_shortcode: shortcodeData,
					},
				} ),
				{
					type: SHORTCODE_RECEIVE,
					siteId: 87654321,
					shortcode: 'test_shortcode',
					data: { ...shortcodeData, result: '<html></html>' },
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
				},
				87654321: {
					test_shortcode: { ...shortcodeData, result: '<html></html>' },
				},
			} );
		} );

		test( 'should accumulate shortcodes in sites', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						test_shortcode: shortcodeData,
					},
					87654321: {
						test_shortcode: { ...shortcodeData, result: '<html></html>' },
					},
				} ),
				{
					type: SHORTCODE_RECEIVE,
					siteId: 12345678,
					shortcode: 'another_shortcode',
					data: { ...shortcodeData, result: '<html><head></head></html>' },
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
					another_shortcode: { ...shortcodeData, result: '<html><head></head></html>' },
				},
				87654321: {
					test_shortcode: { ...shortcodeData, result: '<html></html>' },
				},
			} );
		} );

		test( 'should override previous shortcodes of same site ID', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						test_shortcode: shortcodeData,
					},
					87654321: {
						test_shortcode: { ...shortcodeData, result: '<html></html>' },
					},
				} ),
				{
					type: SHORTCODE_RECEIVE,
					siteId: 87654321,
					shortcode: 'test_shortcode',
					data: shortcodeData,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
				},
				87654321: {
					test_shortcode: shortcodeData,
				},
			} );
		} );

		test( 'should forget gallery shortcodes when receiving a MEDIA ITEM and the id matches', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						test_shortcode: shortcodeData,
					},
					87654321: {
						test_shortcode: { ...shortcodeData, result: '<html></html>' },
					},
				} ),
				{
					type: 'FLUX_RECEIVE_MEDIA_ITEM',
					siteId: 87654321,
					data: {
						ID: 1,
					},
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
				},
				87654321: {},
			} );
		} );

		test( 'should forget gallery shortcodes when receiving MEDIA ITEMS the ids match', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						test_shortcode: shortcodeData,
					},
					87654321: {
						test_shortcode: { ...shortcodeData, result: '<html></html>' },
					},
				} ),
				{
					type: 'FLUX_RECEIVE_MEDIA_ITEMS',
					siteId: 87654321,
					data: {
						media: [ { ID: 1 }, { ID: 2 } ],
					},
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
				},
				87654321: {},
			} );
		} );

		test( 'should persist state', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						test_shortcode: shortcodeData,
					},
					87654321: {
						test_shortcode: { ...shortcodeData, result: '<html></html>' },
					},
				} ),
				{
					type: SERIALIZE,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
				},
				87654321: {
					test_shortcode: { ...shortcodeData, result: '<html></html>' },
				},
			} );
		} );

		test( 'should load valid persisted state', () => {
			const state = items(
				deepFreeze( {
					12345678: {
						test_shortcode: shortcodeData,
					},
					87654321: {
						test_shortcode: { ...shortcodeData, result: '<html></html>' },
					},
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
				},
				87654321: {
					test_shortcode: { ...shortcodeData, result: '<html></html>' },
				},
			} );
		} );

		test( 'should not load invalid persisted state', () => {
			const state = items(
				deepFreeze( {
					1234567: 'test_shortcode',
				} ),
				{
					type: DESERIALIZE,
				}
			);

			expect( state ).to.eql( {} );
		} );
	} );
} );
