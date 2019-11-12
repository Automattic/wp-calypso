/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestPostCounts } from 'state/posts/counts/actions';
import { isRequestingPostCounts } from 'state/posts/counts/selectors';

export default function QuerySiteDomains( { siteId, type } ) {
	const requesting = useSelector( state => isRequestingPostCounts( state, siteId, type ) );
	const dispatch = useDispatch();
	const previousId = useRef( undefined );
	const previousType = useRef( undefined );

	useEffect( () => {
		if ( ! requesting && siteId !== previousId.current && type !== previousType.current ) {
			requestPostCounts( siteId, type )( dispatch );
		}

		previousId.current = siteId;
		previousType.current = type;
	}, [ dispatch, requesting, siteId, type ] );

	return null;
}

QuerySiteDomains.propTypes = {
	siteId: PropTypes.number.isRequired,
	type: PropTypes.string.isRequired,
};
