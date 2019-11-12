/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { fetchSiteDomains } from 'state/sites/domains/actions';

export default function QuerySiteDomains( { siteId } ) {
	const requestingSiteDomains = useSelector( state => isRequestingSiteDomains( state, siteId ) );
	const dispatch = useDispatch();
	const previousId = useRef( undefined );

	useEffect( () => {
		if ( ! requestingSiteDomains && siteId && siteId !== previousId.current ) {
			dispatch( fetchSiteDomains( siteId ) );
		}
		previousId.current = siteId;
	}, [ siteId, requestingSiteDomains, dispatch ] );

	return null;
}

QuerySiteDomains.propTypes = { siteId: PropTypes.number };
