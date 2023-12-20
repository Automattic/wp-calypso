import nock from 'nock';
import {
	JETPACK_CONNECTION_HEALTHY,
	JETPACK_CONNECTION_MAYBE_UNHEALTHY,
	JETPACK_CONNECTION_UNHEALTHY,
	JETPACK_CONNECTION_HEALTH_REQUEST,
} from 'calypso/state/action-types';
import {
	setJetpackConnectionHealthy,
	setJetpackConnectionMaybeUnhealthy,
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
			const requestAction = setJetpackConnectionHealthy( 1 );

			expect( requestAction ).toEqual( {
				type: JETPACK_CONNECTION_HEALTHY,
				siteId: 1,
			} );
		} );
	} );

	describe( 'setJetpackConnectionMaybeUnhealthy', () => {
		test( 'should return a jetpack maybe unhealthy connection action', () => {
			const setTransferAction = setJetpackConnectionMaybeUnhealthy( 1 );

			expect( setTransferAction ).toEqual( {
				type: JETPACK_CONNECTION_MAYBE_UNHEALTHY,
				siteId: 1,
			} );
		} );
	} );

	describe( 'setJetpackConnectionUnhealthy', () => {
		test( 'should return a jetpack unhealthy connection action', () => {
			const setTransferAction = setJetpackConnectionUnhealthy( 1, 'foo_bar' );

			expect( setTransferAction ).toEqual( {
				type: JETPACK_CONNECTION_UNHEALTHY,
				siteId: 1,
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

		test( 'should set connection health to true if the connection api has failed but the health api finds the connection health ok.', async () => {
			const siteId = 1;
			stateSpy.mockReturnValue( {
				jetpackConnectionHealth: {
					1: {
						connectionHealth: {
							jetpack_connection_problem: true,
							is_healthy: false,
						},
					},
				},
			} );
			mockFetchHealthStatus( siteId ).reply( 200, {
				isHealthy: true,
			} );
			await requestJetpackConnectionHealthStatus( siteId )( dispatchSpy, stateSpy );
			expect( dispatchSpy ).toHaveBeenNthCalledWith( 1, {
				type: JETPACK_CONNECTION_HEALTH_REQUEST,
				siteId: 1,
				lastRequestTime: expect.any( Number ),
			} );
			expect( dispatchSpy ).toHaveBeenNthCalledWith( 2, {
				type: JETPACK_CONNECTION_HEALTHY,
				siteId: 1,
			} );
		} );

		test( 'should set connection health as unhealthy the connection api has failed and the health api has failed too', async () => {
			const siteId = 1;
			stateSpy.mockReturnValue( {
				jetpackConnectionHealth: {
					1: {
						connectionHealth: {
							jetpack_connection_problem: false,
							is_healthy: false,
						},
					},
				},
			} );
			mockFetchHealthStatus( siteId ).reply( 200, {
				isHealthy: false,
				error: 'foo_bar',
			} );
			await requestJetpackConnectionHealthStatus( siteId )( dispatchSpy, stateSpy );
			expect( dispatchSpy ).toHaveBeenNthCalledWith( 1, {
				type: JETPACK_CONNECTION_HEALTH_REQUEST,
				siteId: 1,
				lastRequestTime: expect.any( Number ),
			} );
			expect( dispatchSpy ).toHaveBeenNthCalledWith( 2, {
				type: JETPACK_CONNECTION_UNHEALTHY,
				siteId: 1,
				errorCode: 'foo_bar',
			} );
		} );

		test( 'should return current state if 5 minutes have not passed yet', async () => {
			const siteId = 1;
			stateSpy.mockReturnValue( {
				jetpackConnectionHealth: {
					1: {
						lastRequestTime: Date.now() - 1000 * 60 * 4,
						connectionHealth: {
							is_healthy: true,
						},
					},
				},
			} );
			const isHealthy = await requestJetpackConnectionHealthStatus( siteId )(
				dispatchSpy,
				stateSpy
			);
			expect( isHealthy ).toEqual( true );
			expect( dispatchSpy ).not.toHaveBeenCalled();
		} );
	} );
} );
