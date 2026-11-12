import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { isUserConnected } from 'calypso/state/jetpack-connect/actions';

// Don't skip the check while another request for the site is in flight: the
// authorize page waits for its result before offering "Return to your site".
const request = ( siteId, siteIsOnSitesList ) => ( dispatch ) => {
	dispatch( isUserConnected( siteId, siteIsOnSitesList ) );
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
