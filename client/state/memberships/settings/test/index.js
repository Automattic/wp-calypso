import { MEMBERSHIPS_SETTINGS_RECEIVE } from 'calypso/state/action-types';
import reducer from '../reducer';
import { getConnectedAccountAcceptsChargesForSiteId } from '../selectors';

const siteId = 123;

describe( 'getConnectedAccountAcceptsChargesForSiteId', () => {
	test.each( [
		[ 'false', { connected_account_accepts_charges: false }, false ],
		[ 'missing', {}, true ],
	] )( 'handles a %s field', ( _, data, expected ) => {
		const state = {
			memberships: {
				settings: reducer( {}, { type: MEMBERSHIPS_SETTINGS_RECEIVE, siteId, data } ),
			},
		};
		expect( getConnectedAccountAcceptsChargesForSiteId( state, siteId ) ).toBe( expected );
	} );
} );
