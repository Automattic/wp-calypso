import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestJetpackConnectionHealthStatus } from 'calypso/state/jetpack-connection-health/actions';
import isRequestingJetpackConnectionHealthStatus from 'calypso/state/jetpack-connection-health/selectors/is-requesting-jetpack-connection-health-status';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingJetpackConnectionHealthStatus( getState(), siteId ) ) {
		dispatch( requestJetpackConnectionHealthStatus( siteId ) );
	}
};

function QueryJetpackConnectionHealth( { siteId } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		if ( ! siteId ) {
			return;
		}
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryJetpackConnectionHealth.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryJetpackConnectionHealth;
