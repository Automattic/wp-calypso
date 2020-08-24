/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteDomains } from 'state/sites/domains/selectors';
import { fetchSiteDomains } from 'state/sites/domains/actions';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSiteDomains( getState(), siteId ) ) {
		dispatch( fetchSiteDomains( siteId ) );
	}
};

export default function QuerySiteDomains( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteDomains.propTypes = { siteId: PropTypes.number.isRequired };
