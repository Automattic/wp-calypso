/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	USER_DEVICES_REQUEST,
	USER_DEVICES_REQUEST_FAILURE,
	USER_DEVICES_REQUEST_SUCCESS,
} from 'state/action-types';
import {
	items,
	isRequesting,
} from '../reducer';

describe( 'reducer', () => {
	describe( 'items', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should store the user devices when a request is successful', () => {
			const state = items( null, {
				type: USER_DEVICES_REQUEST_SUCCESS,
				devices: [
					{ device_id: 1, device_name: 'Mobile Phone' },
					{ device_id: 2, device_name: 'Tablet' }
				]
			} );

			expect( state ).to.eql( {
				1: { device_id: 1, device_name: 'Mobile Phone' },
				2: { device_id: 2, device_name: 'Tablet' }
			} );
		} );

		it( 'should replace state when a request is successful', () => {
			const state = deepFreeze( {
				1: { device_id: 1, device_name: 'Mobile Phone' },
				2: { device_id: 2, device_name: 'Tablet' }
			} );
			const newState = items( state, {
				type: USER_DEVICES_REQUEST_SUCCESS,
				devices: [
					{ device_id: 3, device_name: 'Refrigerator' },
					{ device_id: 4, device_name: 'Microwave' }
				]
			} );

			expect( newState ).to.eql( {
				3: { device_id: 3, device_name: 'Refrigerator' },
				4: { device_id: 4, device_name: 'Microwave' }
			} );
		} );
	} );

	describe( 'isRequesting', () => {
		it( 'should default to a false', () => {
			const state = isRequesting( undefined, {} );

			expect( state ).to.be.false;
		} );

		it( 'should set isRequesting to true value if a request is initiated', () => {
			const state = isRequesting( undefined, {
				type: USER_DEVICES_REQUEST,
			} );

			expect( state ).to.be.true;
		} );

		it( 'should set isRequesting to false value if a request was unsuccessful', () => {
			const state = isRequesting( undefined, {
				type: USER_DEVICES_REQUEST_FAILURE,
			} );

			expect( state ).to.be.false;
		} );

		it( 'should set isRequesting to false value if a request was successful', () => {
			const state = isRequesting( undefined, {
				type: USER_DEVICES_REQUEST_SUCCESS,
			} );

			expect( state ).to.be.false;
		} );
	} );
} );
