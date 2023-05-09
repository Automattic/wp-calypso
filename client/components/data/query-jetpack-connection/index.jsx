import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestJetpackConnectionStatus } from 'calypso/state/jetpack/connection/actions';
import isRequestingJetpackConnectionStatus from 'calypso/state/selectors/is-requesting-jetpack-connection-status';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingJetpackConnectionStatus( getState(), siteId ) ) {
		dispatch( requestJetpackConnectionStatus( siteId ) );
	}
};

function QueryJetpackConnection( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryJetpackConnection.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryJetpackConnection;
