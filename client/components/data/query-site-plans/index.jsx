/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSitePlans } from 'state/sites/plans/selectors';
import { fetchSitePlans } from 'state/sites/plans/actions';

export default function QuerySitePlans( { siteId } ) {
	const requestingSitePlans = useSelector( isRequestingSitePlans );
	const dispatch = useDispatch();
	const previousId = useRef( undefined );

	useEffect( () => {
		if ( ! requestingSitePlans && siteId && siteId !== previousId.current ) {
			fetchSitePlans( siteId )( dispatch );
		}
		previousId.current = siteId;
	}, [ dispatch, requestingSitePlans, siteId ] );

	return null;
}

QuerySitePlans.propTypes = { siteId: PropTypes.number };
