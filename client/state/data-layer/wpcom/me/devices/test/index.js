/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	userDevicesRequestSuccess,
	userDevicesRequestFailure,
} from 'state/user-devices/actions';
import {
	requestUserDevices,
	handleSuccess,
	handleError,
} from '../';

describe( 'wpcom-api', () => {
	describe( 'user devices', () => {
		describe( '#requestUserDevices', () => {
			it( 'should dispatch HTTP request to the users devices endpoint', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const next = spy();

				requestUserDevices( { dispatch }, action, next );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( http( {
					apiVersion: '1.1',
					method: 'GET',
					path: '/notifications/devices'
				} ) );
			} );

			it( 'should pass the original action along the middleware chain', () => {
				const action = { type: 'DUMMY' };
				const dispatch = spy();
				const next = spy();

				requestUserDevices( { dispatch }, action, next );

				expect( next ).to.have.been.calledWith( action );
			} );
		} );

		describe( '#handleSuccess', () => {
			it( 'should dispatch user devices updates', () => {
				const devices = [
					{ device_id: 1, device_name: 'Mobile Phone' },
					{ device_id: 2, device_name: 'Tablet' }
				];
				const action = userDevicesRequestSuccess( { devices } );
				const dispatch = spy();
				const next = spy();

				handleSuccess( { dispatch }, action, next, devices );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( userDevicesRequestSuccess( { devices } ) );
			} );
		} );

		describe( '#handleError', () => {
			it( 'should dispatch error', () => {
				const action = userDevicesRequestFailure();
				const dispatch = spy();

				handleError( { dispatch }, action );

				expect( dispatch ).to.have.been.calledOnce;
				expect( dispatch ).to.have.been.calledWith( userDevicesRequestFailure() );
			} );
		} );
	} );
} );
