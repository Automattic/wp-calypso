import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import isRequestingSiteConnectionStatus from 'calypso/state/selectors/is-requesting-site-connection-status';
import { requestConnectionStatus } from 'calypso/state/sites/connection/actions';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSiteConnectionStatus( getState(), siteId ) ) {
		dispatch( requestConnectionStatus( siteId ) );
	}
};

export default function QuerySiteConnectionStatus( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QuerySiteConnectionStatus.propTypes = {
	siteId: PropTypes.number.isRequired,
};
