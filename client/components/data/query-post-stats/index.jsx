import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { requestPostStats } from 'calypso/state/stats/posts/actions';
import { isRequestingPostStats } from 'calypso/state/stats/posts/selectors';

function useMemoizedFields( fields ) {
	const memoizedFields = useRef();
	const joinedArray = fields.join();

	if ( joinedArray !== memoizedFields.current ) {
		memoizedFields.current = joinedArray;
	}

	return memoizedFields.current;
}

const request = ( siteId, postId, fields ) => ( dispatch, getState ) => {
	if ( ! isRequestingPostStats( getState(), siteId, postId, fields ) ) {
		dispatch( requestPostStats( siteId, postId, fields ) );
	}
};

function QueryPostStats( { siteId, postId, fields } ) {
	const dispatch = useDispatch();
	const memoizedFields = useMemoizedFields( fields );

	useEffect( () => {
		if ( siteId && postId ) {
			dispatch( request( siteId, postId, memoizedFields.split( ',' ) ) );
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
