import { getQueryArg } from '@wordpress/url';
import { Dispatch, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClient } from 'calypso/state/a8c-for-agencies/client/actions';
import { hasFetchedClient } from 'calypso/state/a8c-for-agencies/client/selectors';

/**
 * This function is used to get the agencyId and clientId from sessionStorage or URL query parameters.
 * It first checks if the CLIENT_INFO is stored in the sessionStorage.
 * If it is, it returns the agencyId and clientId from the sessionStorage.
 * If not, it tries to get the agencyId and clientId from the URL query parameters.
 */
const getClientAPIParams = (): {
	agencyId: string | null;
	clientId: string | null;
} => {
	const returnArgs = getQueryArg( window.location.href, 'return' )?.toString();

	const storage = sessionStorage.getItem( 'CLIENT_INFO' );

	if ( storage ) {
		const { agencyId, clientId } = JSON.parse( storage );
		return {
			agencyId,
			clientId,
		};
	}

	let agencyId = null;
	let clientId = null;

	const regex = /\/agency\/([^/]+)\/client\/([^/]+)/;
	const matches = returnArgs && returnArgs.match( regex );

	if ( matches ) {
		agencyId = matches[ 1 ];
		clientId = matches[ 2 ];
		if ( agencyId && clientId ) {
			sessionStorage.setItem( 'CLIENT_INFO', JSON.stringify( { agencyId, clientId } ) );
		}
	}

	return {
		agencyId,
		clientId,
	};
};

export const useAgencyQueryClient = () => {
	const dispatch = useDispatch() as Dispatch< any >;
	const hasFetched = useSelector( hasFetchedClient );

	const { agencyId, clientId } = getClientAPIParams();

	useEffect( () => {
		if ( ! hasFetched && agencyId && clientId ) {
			dispatch( fetchClient( { agencyId, clientId } ) );
		}
	}, [ hasFetched, dispatch, agencyId, clientId ] );
};

export default function QueryAgencyClient() {
	useAgencyQueryClient();

	return null;
}
