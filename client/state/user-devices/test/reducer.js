/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	USER_DEVICES_ADD,
} from 'state/action-types';
import items from '../reducer';

describe( 'reducer', () => {
	describe( 'items', () => {
		it( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'should store the user devices when a request is successful', () => {
			const state = items( null, {
				type: USER_DEVICES_ADD,
				devices: {
					1: { id: 1, name: 'Mobile Phone' },
					2: { id: 2, name: 'Tablet' }
				}
			} );

			expect( state ).to.eql( {
				1: { id: 1, name: 'Mobile Phone' },
				2: { id: 2, name: 'Tablet' }
			} );
		} );

		it( 'should replace state when a request is successful', () => {
			const state = deepFreeze( {
				1: { id: 1, name: 'Mobile Phone' },
				2: { id: 2, name: 'Tablet' }
			} );
			const newState = items( state, {
				type: USER_DEVICES_ADD,
				devices: {
					3: { id: 3, name: 'Refrigerator' },
					4: { id: 4, name: 'Microwave' }
				}
			} );

			expect( newState ).to.eql( {
				3: { id: 3, name: 'Refrigerator' },
				4: { id: 4, name: 'Microwave' }
			} );
		} );
	} );
} );
