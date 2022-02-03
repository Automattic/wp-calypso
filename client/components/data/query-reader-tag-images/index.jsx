import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { requestTagImages } from 'calypso/state/reader/tags/images/actions';
import { shouldRequestTagImages } from 'calypso/state/reader/tags/images/selectors';

function QueryReaderTagImages( { tag } ) {
	const dispatch = useDispatch();
	const shouldFetch = useSelector( ( state ) => shouldRequestTagImages( state, tag ) );

	useEffect( () => {
		if ( tag && shouldFetch ) {
			dispatch( requestTagImages( tag ) );
		}
	}, [ dispatch, tag, shouldFetch ] );

	return null;
}

export default QueryReaderTagImages;
