import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAtomicGeoAffinity } from 'calypso/state/hosting/actions';

export default function QuerySiteGeoAffinity( { siteId } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( getAtomicGeoAffinity( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
