import { getRequestKey, reducer as dataRequests } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestSubscribers } from 'calypso/state/memberships/subscribers/actions';
import { handleMembershipGetSubscribers } from '..';

test( 'subscriber request errors are recorded as request failures', () => {
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
	const dispatched = [];

	handleMembershipGetSubscribers(
		{
			dispatch: ( action ) => {
				dispatched.push( action );
			},
		},
		failure
	);

	const requestKey = getRequestKey( request );

	expect( dispatched ).toHaveLength( 1 );
	expect( dispatched[ 0 ] ).toMatchObject( {
		type: request.type,
		meta: {
			dataLayer: {
				doBypass: true,
				requestKey,
				status: 'failure',
			},
		},
	} );
	expect( dataRequests( {}, dispatched[ 0 ] ) ).toMatchObject( {
		[ requestKey ]: { status: 'failure' },
	} );
} );
