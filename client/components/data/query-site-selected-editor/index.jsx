/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSelectedEditor } from 'state/selected-editor/actions';

export default function QuerySiteDomains( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestSelectedEditor( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteDomains.propTypes = { siteId: PropTypes.number };
