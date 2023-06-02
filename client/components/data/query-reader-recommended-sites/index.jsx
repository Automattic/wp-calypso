import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestRecommendedSites } from 'calypso/state/reader/recommended-sites/actions';

function QueryReaderRecommendedSites( { seed = 0, offset = 0 } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestRecommendedSites( { seed, offset } ) );
	}, [ dispatch, seed, offset ] );

	return null;
}

export default QueryReaderRecommendedSites;
