/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { getCredentials } from 'calypso/state/jetpack/credentials/actions';
import isRequestingSiteCredentials from 'calypso/state/selectors/is-requesting-site-credentials';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSiteCredentials( getState(), siteId ) ) {
		dispatch( getCredentials( siteId ) );
	}
};

export default function QuerySiteCredentials( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteCredentials.propTypes = { siteId: PropTypes.number };
