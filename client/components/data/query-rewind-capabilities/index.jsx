import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestRewindCapabilities } from 'calypso/state/rewind/capabilities/actions';

export default function QueryRewindCapabilities( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId ) {
			dispatch( requestRewindCapabilities( siteId ) );
		}
	}, [ dispatch, siteId ] );

	return null;
}
