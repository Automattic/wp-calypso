/**
 * Internal dependencies
 */
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import { handleRemoveError, handleRemoveSuccess, removeConnectedApplication } from '../';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	deleteConnectedApplication,
	deleteConnectedApplicationSuccess,
} from 'calypso/state/connected-applications/actions';

const appId = '12345678';

describe( 'removeConnectedApplication()', () => {
	test( 'should return an action for HTTP request to remove a connected application', () => {
		const action = deleteConnectedApplication( appId );
		const result = removeConnectedApplication( action );

		expect( result ).toEqual(
			http(
				{
					apiVersion: '1.1',
					method: 'POST',
					path: '/me/connected-applications/' + appId + '/delete',
				},
				action
			)
		);
	} );
} );

describe( 'handleRemoveSuccess()', () => {
	test( 'should return a connected application remove success action and a success notice action', () => {
		const actions = handleRemoveSuccess( { appId } );

		expect( actions ).toHaveLength( 2 );
		expect( actions[ 0 ] ).toEqual( deleteConnectedApplicationSuccess( appId ) );
		expect( actions[ 1 ] ).toMatchObject(
			successNotice( 'This application no longer has access to your WordPress.com account.', {
				duration: 8000,
				id: `connected-app-notice-success-${ appId }`,
			} )
		);
	} );
} );

describe( 'handleRemoveError()', () => {
	test( 'should return a connected application remove failure action', () => {
		const action = handleRemoveError();

		expect( action ).toMatchObject(
			errorNotice( 'The connected application was not disconnected. Please try again.', {
				duration: 8000,
				id: 'connected-app-notice-error',
			} )
		);
	} );
} );
