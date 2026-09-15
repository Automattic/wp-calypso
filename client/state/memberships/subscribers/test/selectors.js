import { hasLoadedSubscribersForSiteId } from '../selectors';

describe( 'hasLoadedSubscribersForSiteId()', () => {
	test( 'returns false before subscribers are received for the site', () => {
		const state = {
			memberships: {
				subscribers: { list: { 2: { total: 0, ownerships: {} } } },
			},
		};

		expect( hasLoadedSubscribersForSiteId( state, 1 ) ).toBe( false );
	} );

	test( 'returns true after an empty subscriber list is received for the site', () => {
		const state = {
			memberships: {
				subscribers: { list: { 1: { total: 0, ownerships: {} } } },
			},
		};

		expect( hasLoadedSubscribersForSiteId( state, 1 ) ).toBe( true );
	} );
} );
