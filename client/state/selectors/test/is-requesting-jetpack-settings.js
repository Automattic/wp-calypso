import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestJetpackSettings } from 'calypso/state/jetpack/settings/actions';
import isRequestingJetpackSettings from 'calypso/state/selectors/is-requesting-jetpack-settings';

describe( 'isRequestingJetpackSettings()', () => {
	test( 'should return true if settings are currently being requested', () => {
		const siteId = 87654321;
		const action = requestJetpackSettings( siteId );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRequestingJetpackSettings( state, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return false if settings are currently not being requested', () => {
		const siteId = 87654321;
		const action = requestJetpackSettings( siteId );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'success',
				},
			},
		};

		const output = isRequestingJetpackSettings( state, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return false if that site is not known', () => {
		const siteId = 87654321;
		const action = requestJetpackSettings( 12345678 );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRequestingJetpackSettings( state, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return true if settings are currently being requested for a matching site ID', () => {
		const siteId = 87654321;
		const action = requestJetpackSettings( siteId );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRequestingJetpackSettings( state, siteId );
		expect( output ).toBe( true );
	} );
} );
