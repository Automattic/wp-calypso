import nock from 'nock';
import {
	JETPACK_CONNECTION_HEALTHY,
	JETPACK_CONNECTION_MAYBE_UNHEALTHY,
	JETPACK_CONNECTION_UNHEALTHY,
	JETPACK_CONNECTION_HEALTH_REQUEST,
	JETPACK_CONNECTION_HEALTH_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import {
	setJetpackConnectionHealthy,
	setJetpackConnectionMaybeUnhealthy,
	setJetpackConnectionRequestFailure,
	setJetpackConnectionUnhealthy,
	requestJetpackConnectionHealthStatus,
} from '../actions';

const mockFetchHealthStatus = ( siteId ) =>
	nock( 'https://public-api.wordpress.com' ).get(
		`/wpcom/v2/sites/${ siteId }/jetpack-connection-health`
	);

describe( 'action', () => {
	describe( 'setJetpackConnectionHealthy', () => {
		test( 'should return a jetpack healthy connection action', () => {
			const siteId = 123456;
			const requestAction = setJetpackConnectionHealthy( siteId );

			expect( requestAction ).toEqual( {
				type: JETPACK_CONNECTION_HEALTHY,
				siteId,
			} );
		} );
	} );

	describe( 'setJetpackConnectionMaybeUnhealthy', () => {
		test( 'should return a jetpack maybe unhealthy connection action', () => {
			const siteId = 123456;
			const setTransferAction = setJetpackConnectionMaybeUnhealthy( siteId );

			expect( setTransferAction ).toEqual( {
				type: JETPACK_CONNECTION_MAYBE_UNHEALTHY,
				siteId,
			} );
		} );
	} );

	describe( 'setJetpackConnectionUnhealthy', () => {
		test( 'should return a jetpack unhealthy connection action', () => {
			const siteId = 123456;
			const setTransferAction = setJetpackConnectionUnhealthy( siteId, 'foo_bar' );

			expect( setTransferAction ).toEqual( {
				type: JETPACK_CONNECTION_UNHEALTHY,
				siteId,
				errorCode: 'foo_bar',
			} );
		} );
	} );

	describe( 'requestJetpackConnectionHealthStatus', () => {
		let dispatchSpy;
		let stateSpy;

		beforeEach( () => {
			dispatchSpy = jest.fn();
			stateSpy = jest.fn();
		} );

		test( 'should set connection health as healthy if the connection api has failed but the health api finds the connection health ok.', async () => {
			const siteId = 123456;
			stateSpy.mockReturnValue( {
				jetpackConnectionHealth: {
					[ siteId ]: {
						connectionHealth: {
							jetpack_connection_problem: true,
							error: 'test',
						},
					},
				},
			} );
			mockFetchHealthStatus( siteId ).reply( 200, {
				is_healthy: true,
			} );
			await requestJetpackConnectionHealthStatus( siteId )( dispatchSpy, stateSpy );
			expect( dispatchSpy ).toHaveBeenNthCalledWith( 1, {
				type: JETPACK_CONNECTION_HEALTH_REQUEST,
				siteId,
				lastRequestTime: expect.any( Number ),
			} );
			expect( dispatchSpy ).toHaveBeenNthCalledWith( 2, {
				type: JETPACK_CONNECTION_HEALTHY,
				siteId,
			} );
		} );

		test( 'should set connection health as unhealthy the connection api has failed and the health api has failed too', async () => {
			const siteId = 123456;
			stateSpy.mockReturnValue( {
				jetpackConnectionHealth: {
					[ siteId ]: {
						connectionHealth: {
							jetpack_connection_problem: false,
							error: 'test',
						},
					},
				},
			} );
			mockFetchHealthStatus( siteId ).reply( 200, {
				is_healthy: false,
				error: 'foo_bar',
			} );
			await requestJetpackConnectionHealthStatus( siteId )( dispatchSpy, stateSpy );
			expect( dispatchSpy ).toHaveBeenNthCalledWith( 1, {
				type: JETPACK_CONNECTION_HEALTH_REQUEST,
				siteId,
				lastRequestTime: expect.any( Number ),
			} );
			expect( dispatchSpy ).toHaveBeenNthCalledWith( 2, {
				type: JETPACK_CONNECTION_UNHEALTHY,
				siteId,
				errorCode: 'foo_bar',
			} );
		} );
	} );
	describe( 'setJetpackConnectionRequestFailure', () => {
		test( 'should return a jetpack connection request failure action', () => {
			const siteId = 123456;
			const errorCode = 'test';
			const setTransferAction = setJetpackConnectionRequestFailure( siteId, errorCode );

			expect( setTransferAction ).toEqual( {
				type: JETPACK_CONNECTION_HEALTH_REQUEST_FAILURE,
				siteId,
				error: errorCode,
			} );
		} );
	} );
} );
