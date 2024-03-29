import isRequestingJetpackUserConnection from 'calypso/state/selectors/is-requesting-jetpack-user-connection';
import { requests as REQUESTS_FIXTURE } from './fixtures/jetpack-connection';

describe( 'isRequestingJetpackUserConnection()', () => {
	test( 'should return true if the user connection data is being fetched', () => {
		const stateIn = {
			jetpack: {
				connection: {
					dataRequests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 87654321;
		const output = isRequestingJetpackUserConnection( stateIn, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return false if the user connection data is not being fetched', () => {
		const stateIn = {
			jetpack: {
				connection: {
					dataRequests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 12345678;
		const output = isRequestingJetpackUserConnection( stateIn, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return false if the site is not known yet', () => {
		const stateIn = {
			jetpack: {
				connection: {
					dataRequests: REQUESTS_FIXTURE,
				},
			},
		};
		const siteId = 88888888;
		const output = isRequestingJetpackUserConnection( stateIn, siteId );
		expect( output ).toBe( false );
	} );
} );
