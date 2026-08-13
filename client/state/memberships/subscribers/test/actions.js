import { MEMBERSHIPS_SUBSCRIBERS_LIST } from 'calypso/state/action-types';
import { requestSubscribers } from '../actions';

test( 'requestSubscribers() tracks the request status', () => {
	expect( requestSubscribers( 1, 0 ) ).toEqual( {
		meta: { dataLayer: { trackRequest: true } },
		offset: 0,
		siteId: 1,
		type: MEMBERSHIPS_SUBSCRIBERS_LIST,
	} );
} );
