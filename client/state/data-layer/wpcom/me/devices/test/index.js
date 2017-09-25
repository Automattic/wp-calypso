/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestUserDevices, handleSuccess, handleError } from '../';
import { NOTICE_CREATE, USER_DEVICES_ADD } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'wpcom-api', () => {
	describe( 'user devices', () => {
		describe( '#requestUserDevices', () => {
			it( 'should dispatch HTTP request to the users devices endpoint', () => {
				const dispatch = spy();

				requestUserDevices( { dispatch } );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'GET',
					path: '/notifications/devices'
				} ) );
			} );
		} );

		describe( '#handleSuccess', () => {
			it( 'should dispatch user devices updates', () => {
				const devices = [
					{ device_id: 1, device_name: 'Mobile Phone' },
					{ device_id: 2, device_name: 'Tablet' }
				];
				const dispatch = spy();

				handleSuccess( { dispatch }, null, devices );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( {
					type: USER_DEVICES_ADD,
					devices: {
						1: { id: 1, name: 'Mobile Phone' },
						2: { id: 2, name: 'Tablet' }
					}
				} );
			} );
		} );

		describe( '#handleError', () => {
			it( 'should dispatch error notice', () => {
				const dispatch = spy();

				handleError( { dispatch } );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWithMatch( {
					type: NOTICE_CREATE,
					notice: {
						status: 'is-error'
					}
				} );
			} );
		} );
	} );
} );
