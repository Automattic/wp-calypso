/** @format */

/**
 * Internal dependencies
 */
import { addApplicationPassword, handleAddError, handleAddSuccess } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	createApplicationPassword,
	requestApplicationPasswords,
} from 'state/application-passwords/actions';

describe( 'addApplicationPassword()', () => {
	test( 'should return an action for HTTP request to create an application password', () => {
		const applicationName = 'Test Name';
		const action = createApplicationPassword( applicationName );
		const result = addApplicationPassword( action );

		expect( result ).toEqual(
			http(
				{
					apiVersion: '1.1',
					method: 'POST',
					path: '/me/two-step/application-passwords/new',
					body: {
						application_name: applicationName,
					},
				},
				action
			)
		);
	} );
} );

describe( 'handleAddSuccess()', () => {
	test( 'should return an application passwords request action', () => {
		const action = handleAddSuccess();

		expect( action ).toEqual( requestApplicationPasswords() );
	} );
} );

describe( 'handleAddError()', () => {
	test( 'should return an application password create failure action', () => {
		const action = handleAddError();

		expect( action ).toMatchObject( {
			notice: expect.objectContaining( {
				status: 'is-error',
				text: 'There was a problem creating your application password. Please try again.',
				duration: 8000,
			} ),
		} );
	} );
} );
