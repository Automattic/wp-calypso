/**
 * Internal dependencies
 */
import { addApplicationPassword, apiTransformer, handleAddError, handleAddSuccess } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	createApplicationPassword,
	createApplicationPasswordSuccess,
	requestApplicationPasswords,
} from 'calypso/state/application-passwords/actions';

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
	test( 'should return a create success action and an application passwords request action', () => {
		const appPassword = 'abcd 1234 efgh 5678';
		const action = handleAddSuccess( null, appPassword );

		expect( action ).toEqual( [
			createApplicationPasswordSuccess( appPassword ),
			requestApplicationPasswords(),
		] );
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

describe( 'apiTransformer()', () => {
	test( 'should transform original response for a successful request', () => {
		const appPassword = 'abcd 1234 efgh 5678';

		expect( apiTransformer( { application_password: appPassword } ) ).toBe( appPassword );
	} );
} );
