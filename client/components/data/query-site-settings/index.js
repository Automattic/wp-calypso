/**
 * External dependencies
 */

import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { isRequestingSiteSettings } from 'calypso/state/site-settings/selectors';
import { requestSiteSettings } from 'calypso/state/site-settings/actions';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingSiteSettings( getState(), siteId ) ) {
		dispatch( requestSiteSettings( siteId ) );
	}
};

function QuerySiteSettings( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteSettings.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QuerySiteSettings;
