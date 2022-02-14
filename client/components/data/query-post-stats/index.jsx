import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useMemoizedValue } from 'calypso/lib/use-memoized-value';
import { requestPostStats } from 'calypso/state/stats/posts/actions';
import { isRequestingPostStats } from 'calypso/state/stats/posts/selectors';

const request = ( siteId, postId, fields ) => ( dispatch, getState ) => {
	if ( ! isRequestingPostStats( getState(), siteId, postId, fields ) ) {
		dispatch( requestPostStats( siteId, postId, fields ) );
	}
};

function QueryPostStats( { siteId, postId, fields } ) {
	const dispatch = useDispatch();
	const memoizedFields = useMemoizedValue( fields, ( a, b ) => a?.join() !== b?.join() );

	useEffect( () => {
		if ( siteId && postId ) {
			dispatch( request( siteId, postId, memoizedFields ) );
		}
	}, [ dispatch, siteId, postId, memoizedFields ] );

	return null;
}

QueryPostStats.propTypes = {
	siteId: PropTypes.number,
	postId: PropTypes.number,
	fields: PropTypes.array,
};

export default QueryPostStats;
