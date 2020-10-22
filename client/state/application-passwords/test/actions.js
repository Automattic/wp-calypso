/**
 * Internal dependencies
 */
import {
	clearNewApplicationPassword,
	createApplicationPassword,
	createApplicationPasswordSuccess,
	deleteApplicationPassword,
	deleteApplicationPasswordSuccess,
	receiveApplicationPasswords,
	requestApplicationPasswords,
} from '../actions';
import {
	APPLICATION_PASSWORD_CREATE,
	APPLICATION_PASSWORD_CREATE_SUCCESS,
	APPLICATION_PASSWORD_DELETE,
	APPLICATION_PASSWORD_DELETE_SUCCESS,
	APPLICATION_PASSWORD_NEW_CLEAR,
	APPLICATION_PASSWORDS_RECEIVE,
	APPLICATION_PASSWORDS_REQUEST,
} from 'calypso/state/action-types';

describe( 'actions', () => {
	describe( 'requestApplicationPasswords()', () => {
		test( 'should return an application passwords request action object', () => {
			const action = requestApplicationPasswords();

			expect( action ).toEqual( {
				type: APPLICATION_PASSWORDS_REQUEST,
			} );
		} );
	} );

	describe( 'receiveApplicationPasswords()', () => {
		test( 'should return an application passwords receive action object', () => {
			const appPasswords = [
				{
					ID: 12345,
					name: 'example',
					generated: '2012-01-01T00:00:00+00:00',
				},
			];
			const action = receiveApplicationPasswords( appPasswords );

			expect( action ).toEqual( {
				type: APPLICATION_PASSWORDS_RECEIVE,
				appPasswords,
			} );
		} );
	} );

	describe( 'createApplicationPassword()', () => {
		test( 'should return an application password create action object', () => {
			const applicationName = 'Example App';
			const action = createApplicationPassword( applicationName );

			expect( action ).toEqual( {
				type: APPLICATION_PASSWORD_CREATE,
				applicationName,
			} );
		} );
	} );

	describe( 'createApplicationPasswordSuccess()', () => {
		test( 'should return an application password create success action object', () => {
			const appPassword = 'abcd 1234 efgh 5678';
			const action = createApplicationPasswordSuccess( appPassword );

			expect( action ).toEqual( {
				type: APPLICATION_PASSWORD_CREATE_SUCCESS,
				appPassword,
			} );
		} );
	} );

	describe( 'clearNewApplicationPassword()', () => {
		test( 'should return a new application password clear action object', () => {
			const action = clearNewApplicationPassword();

			expect( action ).toEqual( {
				type: APPLICATION_PASSWORD_NEW_CLEAR,
			} );
		} );
	} );

	describe( 'deleteApplicationPassword()', () => {
		test( 'should return an application password delete action object', () => {
			const appPasswordId = 12345;
			const action = deleteApplicationPassword( appPasswordId );

			expect( action ).toEqual( {
				type: APPLICATION_PASSWORD_DELETE,
				appPasswordId,
			} );
		} );
	} );

	describe( 'deleteApplicationPasswordSuccess()', () => {
		test( 'should return an application password delete success action object', () => {
			const appPasswordId = 12345;
			const action = deleteApplicationPasswordSuccess( appPasswordId );

			expect( action ).toEqual( {
				type: APPLICATION_PASSWORD_DELETE_SUCCESS,
				appPasswordId,
			} );
		} );
	} );
} );
