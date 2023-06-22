import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'calypso/state';
import { requestSiteInvites } from 'calypso/state/invites/actions';
import { isRequestingInvitesForSite } from 'calypso/state/invites/selectors';

const useGetInvitesQuery = ( siteId: number ) => {
	const dispatch = useDispatch();
	const requestingInProgress = useSelector( ( state ) =>
		isRequestingInvitesForSite( state, siteId )
	);

	return useQuery( {
		queryKey: [ 'invites', siteId ],
		queryFn: () => {
			if ( siteId && ! requestingInProgress ) {
				dispatch( requestSiteInvites( siteId ) );
			}
			return null;
		},
	} );
};

export default useGetInvitesQuery;
