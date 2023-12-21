import getJetpackConnectionHealth from 'calypso/state/jetpack-connection-health/selectors/get-jetpack-connection-health';

describe( 'getJetpackConnectionHealth()', () => {
	test( 'should return the connection health object if exists', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: { connectionHealth: { jetpack_connection_problem: true } },
			},
		};
		const siteId = 123456;
		const output = getJetpackConnectionHealth( stateIn, siteId );
		expect( output ).toStrictEqual( {
			jetpack_connection_problem: true,
		} );
	} );
	test( 'should return null if no connection health object exists', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: {},
			},
		};
		const siteId = 123456;
		const output = getJetpackConnectionHealth( stateIn, siteId );
		expect( output ).toEqual( null );
	} );

	test( 'should return null if no connection health object exists in case of not existant siteId', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: {},
			},
		};
		const siteId = 123;
		const output = getJetpackConnectionHealth( stateIn, siteId );
		expect( output ).toEqual( null );
	} );
} );
