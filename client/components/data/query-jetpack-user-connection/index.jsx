import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { requestJetpackUserConnectionData } from 'calypso/state/jetpack/connection/actions';
import isRequestingJetpackUserConnection from 'calypso/state/selectors/is-requesting-jetpack-user-connection';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isRequestingJetpackUserConnection( getState(), siteId ) ) {
		dispatch( requestJetpackUserConnectionData( siteId ) );
	}
};

function QueryJetpackUserConnection( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( request( siteId ) );
	}, [ dispatch, siteId ] );

	return null;
}

QueryJetpackUserConnection.propTypes = {
	siteId: PropTypes.number.isRequired,
};

export default QueryJetpackUserConnection;
