import deepFreeze from 'deep-freeze';
import { REWIND_BACKUPS_SET } from 'calypso/state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	jest.spyOn( console, 'warn' ).mockImplementation();

	test( 'should default to an empty object', () => {
		const state = reducer( undefined, {} );

		expect( state ).toEqual( {} );
	} );

	test( 'should set given backups', () => {
		const state = reducer( undefined, {
			type: REWIND_BACKUPS_SET,
			backups: [ 1, 2, 3 ],
		} );

		expect( state.backups ).toEqual( [ 1, 2, 3 ] );
	} );

	test( 'should override previous backups', () => {
		const previousState = deepFreeze( [ 1, 2, 3 ] );
		const state = reducer( previousState, {
			type: REWIND_BACKUPS_SET,
			backups: [ 4, 5, 6 ],
		} );

		expect( state.backups ).toEqual( [ 4, 5, 6 ] );
	} );

	test( 'should set isInitialized to true', () => {
		const state = reducer( undefined, {
			type: REWIND_BACKUPS_SET,
			backups: [ 1, 2, 3 ],
		} );

		expect( state.isInitialized ).toEqual( true );
	} );
} );
