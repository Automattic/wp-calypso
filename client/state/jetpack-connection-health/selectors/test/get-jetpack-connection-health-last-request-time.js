import getJetpackConnectionHealthLastRequestTime from 'calypso/state/jetpack-connection-health/selectors/get-jetpack-connection-health-last-request-time';

describe( 'getJetpackConnectionHealthRequestError()', () => {
	test( 'should return last request time if any exists', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: { lastRequestTime: 1234 },
			},
		};
		const siteId = 123456;
		const output = getJetpackConnectionHealthLastRequestTime( stateIn, siteId );
		expect( output ).toBe( 1234 );
	} );
	test( 'should return null if there is no last request time in state', () => {
		const stateIn = {
			jetpackConnectionHealth: {},
		};
		const siteId = 123456;
		const output = getJetpackConnectionHealthLastRequestTime( stateIn, siteId );
		expect( output ).toBe( null );
	} );
	test( 'should not break if jetpackConnectionHealth object is missing', () => {
		const stateIn = {};
		const siteId = 123456;
		const output = getJetpackConnectionHealthLastRequestTime( stateIn, siteId );
		expect( output ).toBe( null );
	} );
} );
