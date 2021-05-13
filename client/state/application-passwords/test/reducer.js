/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import reducer, { items, newPassword } from '../reducer';
import {
	APPLICATION_PASSWORD_CREATE_SUCCESS,
	APPLICATION_PASSWORD_DELETE_SUCCESS,
	APPLICATION_PASSWORD_NEW_CLEAR,
	APPLICATION_PASSWORDS_RECEIVE,
} from 'calypso/state/action-types';

describe( 'reducer', () => {
	test( 'should export expected reducer keys', () => {
		const state = reducer( undefined, {} );
		expect( state ).toMatchSnapshot();
	} );

	describe( 'items', () => {
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
			const state = items( undefined, {} );
			expect( state ).toEqual( [] );
		} );

		test( 'should set application passwords to empty array when user has no application passwords', () => {
			const state = items( undefined, {
				type: APPLICATION_PASSWORDS_RECEIVE,
				appPasswords: [],
			} );

			expect( state ).toEqual( [] );
		} );

		test( 'should add application passwords to the initial state', () => {
			const state = items( [], {
				type: APPLICATION_PASSWORDS_RECEIVE,
				appPasswords,
			} );

			expect( state ).toEqual( appPasswords );
		} );

		test( 'should overwrite previous application passwords in state', () => {
			const state = deepFreeze( appPasswords );
			const newState = items( state, {
				type: APPLICATION_PASSWORDS_RECEIVE,
				appPasswords: otherAppPasswords,
			} );

			expect( newState ).toEqual( otherAppPasswords );
		} );

		test( 'should delete application passwords by ID from state', () => {
			const state = deepFreeze( appPasswords );
			const newState = items( state, {
				type: APPLICATION_PASSWORD_DELETE_SUCCESS,
				appPasswordId: appPasswords[ 0 ].ID,
			} );

			expect( newState ).toEqual( [ appPasswords[ 1 ] ] );
		} );
	} );

	describe( 'newPassword', () => {
		const appPassword = 'abcd 1234 efgh 5678';

		test( 'should default to null', () => {
			const state = newPassword( undefined, {} );
			expect( state ).toBeNull();
		} );

		test( 'should set new application password when successfully created', () => {
			const state = newPassword( undefined, {
				type: APPLICATION_PASSWORD_CREATE_SUCCESS,
				appPassword,
			} );

			expect( state ).toBe( appPassword );
		} );

		test( 'should clear new application password when clearing requested', () => {
			const state = newPassword( appPassword, {
				type: APPLICATION_PASSWORD_NEW_CLEAR,
				appPassword,
			} );

			expect( state ).toBeNull();
		} );
	} );
} );
