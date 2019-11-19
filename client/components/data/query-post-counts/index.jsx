/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostCounts } from 'state/posts/counts/actions';
import { isRequestingPostCounts } from 'state/posts/counts/selectors';

const request = ( siteId, type ) => ( dispatch, getState ) => {
	if ( ! isRequestingPostCounts( getState(), siteId, type ) ) {
		dispatch( requestPostCounts( siteId, type ) );
	}
};

export default function QueryPostCounts( { siteId, type } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId, type ) );
	}, [ dispatch, siteId, type ] );

	return null;
}

QueryPostCounts.propTypes = {
	siteId: PropTypes.number.isRequired,
	type: PropTypes.string.isRequired,
};
