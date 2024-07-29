import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestAdminColor } from 'calypso/state/admin-color/actions';

export default function QuerySiteAdminColor( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		siteId && dispatch( requestAdminColor( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
