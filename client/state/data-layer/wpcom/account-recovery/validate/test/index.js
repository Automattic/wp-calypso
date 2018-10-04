/** @format */
/**
 * Internal dependencies
 */
import { fetch, onSuccess, onError } from '../';
import {
	validateRequestSuccess,
	validateRequestError,
	setValidationKey,
} from 'state/account-recovery/reset/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'handleValidateRequest()', () => {
	describe( 'success', () => {
		test( 'should dispatch SUCCESS action on success', () => {
			const action = {
				type: 'DUMMY_ACTION',
				userData: { user: 'foo' },
				method: 'primary_email',
				key: 'a-super-secret-key',
			};
			const { userData, method, key } = action;

			expect( fetch( action ) ).toEqual(
				http(
					{
						method: 'POST',
						apiNamespace: 'wpcom/v2',
						path: '/account-recovery/validate',
						body: {
							...userData,
							method,
							key,
						},
					},
					action
				)
			);
		} );

		test( 'should dispatch SET_VALIDATION_KEY action on success', () => {
			const action = {
				type: 'DUMMY_ACTION',
				userData: { user: 'foo' },
				method: 'primary_email',
				key: 'a-super-secret-key',
			};

			expect( onSuccess( action ) ).toEqual(
				expect.arrayContaining( [ validateRequestSuccess(), setValidationKey( action.key ) ] )
			);
		} );

		test( 'should dispatch ERROR action on failure', () => {
			const error = 'something bad happened';
			expect( onError( {}, error ) ).toEqual( validateRequestError( error ) );
		} );
	} );
} );
