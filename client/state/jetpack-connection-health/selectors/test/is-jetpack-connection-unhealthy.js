import isJetpackConnectionUnhealthy from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-unhealthy';

describe( 'isJetpackConnectionUnhealthy()', () => {
	test( 'should return false if the site may have Jetpack connection problem but was not validated yet', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: { connectionHealth: { jetpack_connection_problem: true } },
			},
		};
		const siteId = 123456;
		const output = isJetpackConnectionUnhealthy( stateIn, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return false if the site Jetpack connection was validated and is healthy', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: { connectionHealth: { jetpack_connection_problem: false, error: '' } },
			},
		};
		const siteId = 123456;
		const output = isJetpackConnectionUnhealthy( stateIn, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return true if the site Jetpack connection was validated and is unhealthy', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: { connectionHealth: { jetpack_connection_problem: true, error: 'A test error' } },
			},
		};
		const siteId = 123456;
		const output = isJetpackConnectionUnhealthy( stateIn, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return false if the site Jetpack connection health status is absent', () => {
		const stateIn = {
			jetpackConnectionHealth: {},
		};
		const siteId = 77777;
		const output = isJetpackConnectionUnhealthy( stateIn, siteId );
		expect( output ).toBe( false );
	} );
} );
