/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSitePlans } from 'state/sites/plans/selectors';
import { fetchSitePlans } from 'state/sites/plans/actions';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSitePlans( getState(), siteId ) ) {
		dispatch( fetchSitePlans( siteId ) );
	}
};

export default function QuerySitePlans( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySitePlans.propTypes = { siteId: PropTypes.number };
