import getJetpackConnectionHealthRequestError from 'calypso/state/jetpack-connection-health/selectors/get-jetpack-connection-health-request-error';

describe( 'getJetpackConnectionHealthRequestError()', () => {
	test( 'should return an error if the health status request has failed', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: { requestError: 'test' },
			},
		};
		const siteId = 123456;
		const output = getJetpackConnectionHealthRequestError( stateIn, siteId );
		expect( output ).toBe( 'test' );
	} );
	test( 'should return null if no error exists', () => {
		const stateIn = {
			jetpackConnectionHealth: {
				123456: {},
			},
		};
		const siteId = 123456;
		const output = getJetpackConnectionHealthRequestError( stateIn, siteId );
		expect( output ).toBe( '' );
	} );
} );
