import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { edgeCacheGetActive } from 'calypso/state/edge-cache/actions';

export default function QueryEdgeCacheActive( { siteId } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( edgeCacheGetActive( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}
