/**
 * Internal dependencies
 */
import { getRequestKey } from 'calypso/state/data-layer/wpcom-http/utils';
import isRequestingJetpackSettings from 'calypso/state/selectors/is-requesting-jetpack-settings';
import { requestJetpackSettings } from 'calypso/state/jetpack/settings/actions';

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

	test( 'should return true if settings are currently being requested for a matching site ID and query', () => {
		const siteId = 87654321;
		const query = { foo: 'bar' };
		const action = requestJetpackSettings( siteId, query );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRequestingJetpackSettings( state, siteId, query );
		expect( output ).toBe( true );
	} );

	test( 'should return false if settings are currently being requested for matching site ID and non-matching query', () => {
		const siteId = 87654321;
		const query = { foo: 'bar' };
		const action = requestJetpackSettings( siteId, { foo: 'baz' } );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRequestingJetpackSettings( state, siteId, query );
		expect( output ).toBe( false );
	} );
} );
