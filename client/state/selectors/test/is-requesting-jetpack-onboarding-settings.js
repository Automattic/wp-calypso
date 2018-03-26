/** @format */

/**
 * Internal dependencies
 */
import { getRequestKey } from 'state/data-layer/wpcom-http/utils';
import { isRequestingJetpackOnboardingSettings } from 'state/selectors';
import { requestJetpackOnboardingSettings } from 'state/jetpack-onboarding/actions';

describe( 'isRequestingJetpackOnboardingSettings()', () => {
	test( 'should return true if settings are currently being requested', () => {
		const siteId = 87654321;
		const action = requestJetpackOnboardingSettings( siteId );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRequestingJetpackOnboardingSettings( state, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return false if settings are currently not being requested', () => {
		const siteId = 87654321;
		const action = requestJetpackOnboardingSettings( siteId );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'success',
				},
			},
		};

		const output = isRequestingJetpackOnboardingSettings( state, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return false if that site is not known', () => {
		const siteId = 87654321;
		const action = requestJetpackOnboardingSettings( 12345678 );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRequestingJetpackOnboardingSettings( state, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return true if settings are currently being requested for a matching site ID and query', () => {
		const siteId = 87654321;
		const query = { foo: 'bar' };
		const action = requestJetpackOnboardingSettings( siteId, query );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRequestingJetpackOnboardingSettings( state, siteId, query );
		expect( output ).toBe( true );
	} );

	test( 'should return false if settings are currently being requested for matching site ID and non-matching query', () => {
		const siteId = 87654321;
		const query = { foo: 'bar' };
		const action = requestJetpackOnboardingSettings( siteId, { foo: 'baz' } );
		const state = {
			dataRequests: {
				[ getRequestKey( action ) ]: {
					status: 'pending',
				},
			},
		};

		const output = isRequestingJetpackOnboardingSettings( state, siteId, query );
		expect( output ).toBe( false );
	} );
} );
