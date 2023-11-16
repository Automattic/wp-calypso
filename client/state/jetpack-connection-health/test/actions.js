import {
	JETPACK_CONNECTION_HEALTHY,
	JETPACK_CONNECTION_MAYBE_UNHEALTHY,
	JETPACK_CONNECTION_UNHEALTHY,
} from 'calypso/state/action-types';
import {
	setJetpackConnectionHealthy,
	setJetpackConnectionMaybeUnhealthy,
	setJetpackConnectionUnhealthy,
} from '../actions';

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
} );
