/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSelectedEditor } from 'state/selected-editor/actions';

export default function QuerySiteDomains( { siteId } ) {
	const dispatch = useDispatch();
	const previousId = useRef( undefined );

	useEffect( () => {
		if ( siteId !== previousId.current ) {
			dispatch( requestSelectedEditor( siteId ) );
		}
		previousId.current = siteId;
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteDomains.propTypes = { siteId: PropTypes.number };
