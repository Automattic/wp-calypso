import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { requestSiteInvites } from 'calypso/state/invites/actions';
import { isRequestingInvitesForSite } from 'calypso/state/invites/selectors';

const useGetInvitesQuery = ( siteId: number ) => {
	const dispatch = useDispatch();
	const requestingInProgress = useSelector( ( state ) =>
		isRequestingInvitesForSite( state, siteId )
	);

	return useQuery( [ 'invites', siteId ], () => {
		if ( siteId && ! requestingInProgress ) {
			dispatch( requestSiteInvites( siteId ) );
		}
		return null;
	} );
};

export default useGetInvitesQuery;
