import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestSiteInvites } from 'calypso/state/invites/actions';
import { isRequestingInvitesForSite } from 'calypso/state/invites/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingInvitesForSite( getState(), siteId ) ) {
		dispatch( requestSiteInvites( siteId ) );
	}
};

function QuerySiteInvites( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

export default QuerySiteInvites;
