import deepFreeze from 'deep-freeze';
import { USER_DEVICES_ADD } from 'calypso/state/action-types';
import items from '../reducer';

describe( 'reducer', () => {
	describe( 'items', () => {
		test( 'should default to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).toEqual( {} );
		} );

		test( 'should add devices to the initial state', () => {
			const state = items( null, {
				type: USER_DEVICES_ADD,
				devices: {
					1: { id: 1, name: 'Mobile Phone' },
					2: { id: 2, name: 'Tablet' },
				},
			} );

			expect( state ).toEqual( {
				1: { id: 1, name: 'Mobile Phone' },
				2: { id: 2, name: 'Tablet' },
			} );
		} );

		test( 'should add new devices to the state', () => {
			const state = deepFreeze( {
				1: { id: 1, name: 'Mobile Phone' },
				2: { id: 2, name: 'Tablet' },
			} );
			const newState = items( state, {
				type: USER_DEVICES_ADD,
				devices: {
					3: { id: 3, name: 'Refrigerator' },
					4: { id: 4, name: 'Microwave' },
				},
			} );

			expect( newState ).toEqual( {
				1: { id: 1, name: 'Mobile Phone' },
				2: { id: 2, name: 'Tablet' },
				3: { id: 3, name: 'Refrigerator' },
				4: { id: 4, name: 'Microwave' },
			} );
		} );
	} );
} );
