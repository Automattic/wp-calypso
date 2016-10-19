/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SHORTCODE_RECEIVE,
	SHORTCODE_REQUEST,
	SHORTCODE_REQUEST_FAILURE,
	SHORTCODE_REQUEST_SUCCESS,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';
import reducer, { requesting, items } from '../reducer';
import { useSandbox } from 'test/helpers/use-sinon';

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

		it( 'should set shortcode of that site ID to true value if a request is initiated', () => {
			const state = requesting( undefined, {
				type: SHORTCODE_REQUEST,
				siteId: 12345678,
				shortcode: 'test_shortcode'
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: true
				}
			} );
		} );

		it( 'should accumulate the requested site IDs', () => {
			const state = requesting( deepFreeze( {
				12345678: {
					test_shortcode: true
				}
			} ), {
				type: SHORTCODE_REQUEST,
				siteId: 87654321,
				shortcode: 'another_shortcode'
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: true
				},
				87654321: {
					another_shortcode: true
				}
			} );
		} );

		it( 'should accumulate the requested shortcodes of given site IDs', () => {
			const state = requesting( deepFreeze( {
				12345678: {
					test_shortcode: false
				},
				87654321: {
					another_shortcode: true
				}
			} ), {
				type: SHORTCODE_REQUEST,
				siteId: 12345678,
				shortcode: 'some_shortcode'
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: false,
					some_shortcode: true
				},
				87654321: {
					another_shortcode: true
				}
			} );
		} );

		it( 'should set shortcode of that site ID to false if request finishes successfully', () => {
			const state = requesting( deepFreeze( {
				12345678: {
					test_shortcode: true,
					another_shortcode: true
				},
				87654321: {
					test_shortcode: true
				}
			} ), {
				type: SHORTCODE_REQUEST_SUCCESS,
				siteId: 12345678,
				shortcode: 'test_shortcode'
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: false,
					another_shortcode: true
				},
				87654321: {
					test_shortcode: true
				}
			} );
		} );

		it( 'should set shortcode of that site ID to false if request finishes unsuccessfully', () => {
			const state = requesting( deepFreeze( {
				12345678: {
					test_shortcode: true,
					another_shortcode: true
				},
				87654321: {
					test_shortcode: true
				}
			} ), {
				type: SHORTCODE_REQUEST_FAILURE,
				siteId: 12345678,
				shortcode: 'test_shortcode',
				error: 'The requested shortcode does not exist.'
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: false,
					another_shortcode: true
				},
				87654321: {
					test_shortcode: true
				}
			} );
		} );

		it( 'should not persist state', () => {
			const state = requesting( deepFreeze( {
				12345678: {
					test_shortcode: true
				}
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );

		it( 'should not load persisted state', () => {
			const state = requesting( deepFreeze( {
				12345678: {
					test_shortcode: true
				}
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );

	describe( '#items()', () => {
		const shortcodeData = {
			body: 'body',
			scripts: {},
			styles: {}
		};

		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should index shortcodes by site ID', () => {
			const state = items( null, {
				type: SHORTCODE_RECEIVE,
				siteId: 12345678,
				shortcode: 'test_shortcode',
				data: shortcodeData
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData
				}
			} );
		} );

		it( 'should accumulate sites', () => {
			const state = items( deepFreeze( {
				12345678: {
					test_shortcode: shortcodeData
				}
			} ), {
				type: SHORTCODE_RECEIVE,
				siteId: 87654321,
				shortcode: 'test_shortcode',
				data: { ...shortcodeData, body: '<html></html>' }
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData
				},
				87654321: {
					test_shortcode: { ...shortcodeData, body: '<html></html>' }
				}
			} );
		} );

		it( 'should accumulate shortcodes in sites', () => {
			const state = items( deepFreeze( {
				12345678: {
					test_shortcode: shortcodeData
				},
				87654321: {
					test_shortcode: { ...shortcodeData, body: '<html></html>' }
				}
			} ), {
				type: SHORTCODE_RECEIVE,
				siteId: 12345678,
				shortcode: 'another_shortcode',
				data: { ...shortcodeData, body: '<html><head></head></html>' }
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData,
					another_shortcode: { ...shortcodeData, body: '<html><head></head></html>' }
				},
				87654321: {
					test_shortcode: { ...shortcodeData, body: '<html></html>' }
				}
			} );
		} );

		it( 'should override previous shortcodes of same site ID', () => {
			const state = items( deepFreeze( {
				12345678: {
					test_shortcode: shortcodeData
				},
				87654321: {
					test_shortcode: { ...shortcodeData, body: '<html></html>' }
				}
			} ), {
				type: SHORTCODE_RECEIVE,
				siteId: 87654321,
				shortcode: 'test_shortcode',
				data: shortcodeData
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData
				},
				87654321: {
					test_shortcode: shortcodeData
				}
			} );
		} );

		it( 'should persist state', () => {
			const state = items( deepFreeze( {
				12345678: {
					test_shortcode: shortcodeData
				},
				87654321: {
					test_shortcode: { ...shortcodeData, body: '<html></html>' }
				}
			} ), {
				type: SERIALIZE
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData
				},
				87654321: {
					test_shortcode: { ...shortcodeData, body: '<html></html>' }
				}
			} );
		} );

		it( 'should load valid persisted state', () => {
			const state = items( deepFreeze( {
				12345678: {
					test_shortcode: shortcodeData
				},
				87654321: {
					test_shortcode: { ...shortcodeData, body: '<html></html>' }
				}
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {
				12345678: {
					test_shortcode: shortcodeData
				},
				87654321: {
					test_shortcode: { ...shortcodeData, body: '<html></html>' }
				}
			} );
		} );

		it( 'should not load invalid persisted state', () => {
			const state = items( deepFreeze( {
				1234567: 'test_shortcode'
			} ), {
				type: DESERIALIZE
			} );

			expect( state ).to.eql( {} );
		} );
	} );
} );
