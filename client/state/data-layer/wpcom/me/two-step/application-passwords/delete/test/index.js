/** @format */

/**
 * Internal dependencies
 */
import { handleRemoveError, handleRemoveSuccess, removeApplicationPassword } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	deleteApplicationPassword,
	deleteApplicationPasswordSuccess,
} from 'state/application-passwords/actions';

const appPasswordId = 12345;

describe( 'removeApplicationPassword()', () => {
	test( 'should return an action for HTTP request to remove an application password', () => {
		const action = deleteApplicationPassword( appPasswordId );
		const result = removeApplicationPassword( action );

		expect( result ).toEqual(
			http(
				{
					apiVersion: '1.1',
					method: 'POST',
					path: '/me/two-step/application-passwords/' + appPasswordId + '/delete',
				},
				action
			)
		);
	} );
} );

describe( 'handleRemoveSuccess()', () => {
	test( 'should return an application password remove success action', () => {
		const action = handleRemoveSuccess( { appPasswordId } );

		expect( action ).toEqual( deleteApplicationPasswordSuccess( appPasswordId ) );
	} );
} );

describe( 'handleRemoveError()', () => {
	test( 'should return an application password remove failure action', () => {
		const action = handleRemoveError();

		expect( action ).toMatchObject( {
			notice: expect.objectContaining( {
				status: 'is-error',
				text: 'The application password was not successfully deleted. Please try again.',
				duration: 8000,
			} ),
		} );
	} );
} );
