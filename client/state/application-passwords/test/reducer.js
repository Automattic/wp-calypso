/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	APPLICATION_PASSWORD_DELETE_SUCCESS,
	APPLICATION_PASSWORDS_RECEIVE,
} from 'state/action-types';

describe( 'reducer', () => {
	const appPasswords = [
		{
			ID: 12345,
			name: 'Example',
			value: '2018-01-01T00:00:00+00:00',
		},
		{
			ID: 23456,
			name: 'Test',
			value: '2018-02-01T08:10:00+00:00',
		},
	];
	const otherAppPasswords = [
		{
			ID: 54321,
			name: 'Sample',
			value: '2018-03-01T05:30:00+00:00',
		},
	];

	test( 'should default to an empty array', () => {
		const state = reducer( undefined, {} );
		expect( state ).toEqual( [] );
	} );

	test( 'should set application passwords to empty array when user has no application passwords', () => {
		const state = reducer( undefined, {
			type: APPLICATION_PASSWORDS_RECEIVE,
			appPasswords: [],
		} );

		expect( state ).toEqual( [] );
	} );

	test( 'should add application passwords to the initial state', () => {
		const state = reducer( [], {
			type: APPLICATION_PASSWORDS_RECEIVE,
			appPasswords,
		} );

		expect( state ).toEqual( appPasswords );
	} );

	test( 'should overwrite previous application passwords in state', () => {
		const state = deepFreeze( appPasswords );
		const newState = reducer( state, {
			type: APPLICATION_PASSWORDS_RECEIVE,
			appPasswords: otherAppPasswords,
		} );

		expect( newState ).toEqual( otherAppPasswords );
	} );

	test( 'should delete application passwords by ID from state', () => {
		const state = deepFreeze( appPasswords );
		const newState = reducer( state, {
			type: APPLICATION_PASSWORD_DELETE_SUCCESS,
			appPasswordId: appPasswords[ 0 ].ID,
		} );

		expect( newState ).toEqual( [ appPasswords[ 1 ] ] );
	} );
} );
