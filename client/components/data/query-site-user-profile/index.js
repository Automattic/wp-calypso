import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestUserProfile } from 'calypso/state/user-profile/actions';

export default function QuerySiteUserProfile( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		siteId && dispatch( requestUserProfile( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
