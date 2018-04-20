/** @format */

/**
 * Internal dependencies
 */
import { handleRemoveError, handleRemoveSuccess, removeConnectedApplication } from '../';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	deleteConnectedApplication,
	deleteConnectedApplicationSuccess,
} from 'state/connected-applications/actions';

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
		expect( actions[ 1 ] ).toMatchObject( {
			notice: expect.objectContaining( {
				duration: 8000,
				noticeId: `connected-app-notice-success-${ appId }`,
				status: 'is-success',
				text: 'This application no longer has access to your WordPress.com account.',
			} ),
		} );
	} );
} );

describe( 'handleRemoveError()', () => {
	test( 'should return a connected application remove failure action', () => {
		const action = handleRemoveError();

		expect( action ).toMatchObject( {
			notice: expect.objectContaining( {
				duration: 8000,
				noticeId: 'connected-app-notice-error',
				status: 'is-error',
				text: 'The connected application was not disconnected. Please try again.',
			} ),
		} );
	} );
} );
