import { shouldRequestJetpackConnectionHealthStatus } from 'calypso/state/jetpack-connection-health/selectors/should-request-jetpack-connection-health-status';

describe( 'shouldRequestJetpackConnectionHealthStatus()', () => {
	test( 'should return true if the site may have Jetpack connection problem', () => {
		const siteId = 123456;
		const stateIn = {
			jetpackConnectionHealth: {
				[ siteId ]: {
					lastRequestTime: Date.now() - 1000 * 60 * 6,
					connectionHealth: { jetpack_connection_problem: true, error: '' },
				},
			},
		};
		const output = shouldRequestJetpackConnectionHealthStatus( stateIn, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return true if the site Jetpack connection last request time has been exceed threshold', () => {
		const siteId = 123456;
		const stateIn = {
			jetpackConnectionHealth: {
				[ siteId ]: {
					lastRequestTime: Date.now() - 1000 * 60 * 6,
					connectionHealth: { jetpack_connection_problem: true, error: '' },
				},
			},
		};
		const output = shouldRequestJetpackConnectionHealthStatus( stateIn, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return false if site Jetpack connection last request time has been exceed threshold but there is no indication that we have a jetpack connection error', () => {
		const siteId = 123456;
		const stateIn = {
			jetpackConnectionHealth: {
				[ siteId ]: {
					lastRequestTime: Date.now() - 1000 * 60 * 6,
					connectionHealth: { jetpack_connection_problem: false, error: '' },
				},
			},
		};
		const output = shouldRequestJetpackConnectionHealthStatus( stateIn, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return false if the threshold has not been exceeded in case of a possible jetpack connection error', () => {
		const siteId = 123456;
		const stateIn = {
			jetpackConnectionHealth: {
				[ siteId ]: {
					lastRequestTime: Date.now() - 1000 * 60 * 4,
					connectionHealth: { jetpack_connection_problem: true, error: '' },
				},
			},
		};
		const output = shouldRequestJetpackConnectionHealthStatus( stateIn, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return false if the site Jetpack connection health status is absent', () => {
		const stateIn = {
			jetpackConnectionHealth: {},
		};
		const siteId = 77777;
		const output = shouldRequestJetpackConnectionHealthStatus( stateIn, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should not break if jetpackConnectionHealth object is missing', () => {
		const stateIn = {};
		const siteId = 123456;
		const output = shouldRequestJetpackConnectionHealthStatus( stateIn, siteId );
		expect( output ).toBe( false );
	} );
} );
