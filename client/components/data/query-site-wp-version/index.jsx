import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAtomicWpVersion } from 'calypso/state/hosting/actions';

export default function QuerySiteWpVersion( { siteId } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( getAtomicWpVersion( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
