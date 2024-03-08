import isJetpackConnectionProblem from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-problem';

describe( 'isJetpackConnectionProblem()', () => {
	test( 'should return true if the site may have Jetpack connection problem', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: { connectionHealth: { jetpack_connection_problem: true } },
			},
		};
		const siteId = 123456;
		const output = isJetpackConnectionProblem( stateIn, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return false if the site is not marked as one that can have Jetpack connection problem', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: { connectionHealth: { jetpack_connection_problem: false } },
			},
		};
		const siteId = 123456;
		const output = isJetpackConnectionProblem( stateIn, siteId );
		expect( output ).toBe( false );
	} );

	test( 'should return false if the site Jetpack connection problem is unknown', () => {
		const stateIn = {
			jetpackConnectionHealth: { connectionHealth: {} },
		};
		const siteId = 77777;
		const output = isJetpackConnectionProblem( stateIn, siteId );
		expect( output ).toBe( false );
	} );
} );
