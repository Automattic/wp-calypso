/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteChecklist } from 'state/checklist/actions';

export default function QuerySiteChecklist( { siteId } ) {
	const dispatch = useDispatch();
	const previousId = useRef( undefined );

	useEffect( () => {
		if ( siteId !== previousId.current ) {
			dispatch( requestSiteChecklist( siteId ) );
		}
		previousId.current = siteId;
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteChecklist.propTypes = { siteId: PropTypes.number };
