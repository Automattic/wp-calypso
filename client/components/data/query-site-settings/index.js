import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestSiteSettings } from 'calypso/state/site-settings/actions';
import { isRequestingSiteSettings } from 'calypso/state/site-settings/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingSiteSettings( getState(), siteId ) ) {
		dispatch( requestSiteSettings( siteId ) );
	}
};

function QuerySiteSettings( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		siteId && dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteSettings.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QuerySiteSettings;
