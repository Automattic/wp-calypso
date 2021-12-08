import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { isUserConnected } from 'calypso/state/jetpack-connect/actions';
import { isRequestingSite } from 'calypso/state/sites/selectors';

const request = ( siteId, siteIsOnSitesList ) => ( dispatch, getState ) => {
	if ( ! isRequestingSite( getState(), siteId ) ) {
		dispatch( isUserConnected( siteId, siteIsOnSitesList ) );
	}
};

function QueryUserConnection( { siteId, siteIsOnSitesList = false } ) {
	// save the `siteIsOnSitesList` flag to a ref so that it can be used by the request effect,
	// but doesn't trigger a new request when it changes.
	const savedSiteIsOnSitesList = useRef();
	useEffect( () => {
		savedSiteIsOnSitesList.current = siteIsOnSitesList;
	}, [ siteIsOnSitesList ] );

	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( request( siteId, savedSiteIsOnSitesList.current ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryUserConnection.propTypes = {
	siteId: PropTypes.number,
	siteIsOnSitesList: PropTypes.bool,
};

export default QueryUserConnection;
