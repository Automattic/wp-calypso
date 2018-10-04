/** @format */
/**
 * Internal dependencies
 */
import { fromApi, onSuccess, onError } from '../';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
} from 'state/action-types';

const validResponse = {
	primary_email: 'a****@example.com',
	secondary_email: 'b*****@example.com',
	primary_sms: '+1******456',
	secondary_sms: '+8*******456',
};

describe( 'fromApi()', () => {
	test( 'should validate successfully and throw nothing.', () => {
		expect( () => fromApi( validResponse ) ).not.toThrow();
	} );

	test( 'should invalidate missing keys and throw an error.', () => {
		expect( () => fromApi( { primary_email: 'foo@example.com' } ) ).toThrow();
	} );

	test( 'should invalidate unexpected value type and throw an error', () => {
		expect( () =>
			fromApi( {
				primary_email: 'foo@example.com',
				primary_sms: '123456',
				secondary_email: 'bar@example.com',
				secondary_sms: 123456,
			} )
		).toThrow();
	} );
} );

describe( 'handleRequestResetOptions()', () => {
	const userData = { user: 'foo' };

	describe( 'success', () => {
		test( 'should dispatch appropriate actions on success', () => {
			expect( onSuccess( { userData }, fromApi( validResponse ) ) ).toEqual(
				expect.arrayContaining( [
					{
						type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
						items: fromApi( validResponse ),
					},
					{
						type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
						userData,
					},
				] )
			);
		} );
	} );

	describe( 'failure', () => {
		const errorResponse = { status: 400, message: 'Something wrong!' };

		test( 'should dispatch ERROR action on failure', () => {
			expect( onError( { userData }, errorResponse ) ).toEqual( {
				type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
				error: errorResponse,
			} );
		} );
	} );
} );
