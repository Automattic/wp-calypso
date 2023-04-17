import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestRelatedSites } from 'calypso/state/reader/related-sites/actions';

function QueryReaderRelatedSites( { tag = '', offset = 0 } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestRelatedSites( { tag, offset } ) );
	}, [ dispatch, tag, offset ] );

	return null;
}

export default QueryReaderRelatedSites;
