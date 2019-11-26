/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch, connect } from 'react-redux';

/**
 * Internal dependencies
 */
import { requestSiteChecklist } from 'state/checklist/actions';
import isSiteUsingFullSiteEditing from 'state/selectors/is-site-using-full-site-editing';

export function QuerySiteChecklist( { siteId, isSiteUsingFSE } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( requestSiteChecklist( siteId, isSiteUsingFSE ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteChecklist.propTypes = { siteId: PropTypes.number.isRequired };

export default connect( ( state, { siteId } ) => ( {
	isSiteUsingFSE: isSiteUsingFullSiteEditing( state, siteId ),
} ) )( QuerySiteChecklist );
