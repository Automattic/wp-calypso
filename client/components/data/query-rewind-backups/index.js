import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestRewindBackups } from 'calypso/state/rewind/backups/actions';

const QueryRewindBackups = ( { siteId } ) => {
	const dispatch = useDispatch();
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}

		dispatch( requestRewindBackups( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
};

export default QueryRewindBackups;
