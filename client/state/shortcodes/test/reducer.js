/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	SHORTCODE_FETCH,
	SHORTCODE_RECEIVE
} from 'state/action-types';
import { LOAD_STATUS } from '../constants';
import reducer from '../reducer';

describe( 'reducer', () => {
	it( 'should default to {}', () => {
		const state = reducer( undefined, {} );

		expect( state ).to.eql( {} );
	} );

	it( 'should change the status to loading when fetching', () => {
		const state = reducer( {}, {
			type: SHORTCODE_FETCH,
			siteId: 1,
			shortcode: 'test_shortcode',
		} );

		expect( state ).to.eql( {
			1: {
				test_shortcode: {
					status: LOAD_STATUS.LOADING
				}
			}
		} );
	} );

	it( 'should set an error status if an error is received', () => {
		const initialState = deepFreeze( {
			1: {
				test_shortcode: {
					status: LOAD_STATUS.LOADING,
				}
			}
		} );

		const state = reducer( initialState, {
			type: SHORTCODE_RECEIVE,
			siteId: 1,
			shortcode: 'test_shortcode',
			error: 'Some error happened',
		} );

		expect( state ).to.eql( {
			1: {
				test_shortcode: {
					status: LOAD_STATUS.ERROR,
				}
			}
		} );
	} );

	it( 'should only modify status if an error is received', () => {
		const initialState = deepFreeze( {
			1: {
				test_shortcode: {
					status: LOAD_STATUS.LOADED,
					body: 'body',
					scripts: 'scripts',
					styles: 'styles'
				}
			}
		} );

		const state = reducer( initialState, {
			type: SHORTCODE_RECEIVE,
			siteId: 1,
			shortcode: 'test_shortcode',
			error: 'Some error happened',
			data: 'Some broken data'
		} );

		expect( state ).to.eql( {
			1: {
				test_shortcode: {
					status: LOAD_STATUS.ERROR,
					body: 'body',
					scripts: 'scripts',
					styles: 'styles'
				}
			}
		} );
	} );

	it( 'should change status to loaded when shortcode received', () => {
		const initialState = deepFreeze( {
			1: {
				test_shortcode: {
					status: LOAD_STATUS.LOADING,
				}
			}
		} );

		const state = reducer( initialState, {
			type: SHORTCODE_RECEIVE,
			siteId: 1,
			shortcode: 'test_shortcode',
			data: {
				result: 'body',
				scripts: 'scripts',
				styles: 'styles'
			}
		} );

		expect( state ).to.eql( {
			1: {
				test_shortcode: {
					status: LOAD_STATUS.LOADED,
					body: 'body',
					scripts: 'scripts',
					styles: 'styles'
				}
			}
		} );
	} );
} );
