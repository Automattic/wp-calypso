import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { requestSubscribers } from 'calypso/state/memberships/subscribers/actions';
import { handleMembershipSubscribersError } from '..';

test( 'subscriber request errors remain dispatchable for request tracking', () => {
	const request = requestSubscribers( 1, 0 );
	const failure = {
		...request,
		meta: {
			dataLayer: {
				...request.meta.dataLayer,
				error: { message: 'Unable to load subscribers' },
			},
		},
	};

	expect( handleMembershipSubscribersError( failure ) ).toEqual( bypassDataLayer( failure ) );
} );
