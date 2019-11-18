/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteChecklist } from 'state/checklist/actions';

export default function QuerySiteChecklist( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestSiteChecklist( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteChecklist.propTypes = { siteId: PropTypes.number.isRequired };
