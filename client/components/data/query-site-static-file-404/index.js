import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAtomicStaticFile404 } from 'calypso/state/hosting/actions';

export default function QuerySiteStaticFile404( { siteId } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( getAtomicStaticFile404( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
