import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';

describe( 'getSiteConnectionStatus()', () => {
	const siteId = 2916284;

	test( 'should return connection status for a known site', () => {
		const state = {
			siteConnection: {
				items: {
					[ siteId ]: true,
				},
			},
		};
		const output = getSiteConnectionStatus( state, siteId );
		expect( output ).toBe( true );
	} );

	test( 'should return null for an unknown site', () => {
		const state = {
			siteConnection: {
				items: {
					77203074: true,
				},
			},
		};
		const output = getSiteConnectionStatus( state, siteId );
		expect( output ).toBeNull();
	} );
} );
