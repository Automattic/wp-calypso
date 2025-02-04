import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { testCredentials } from 'calypso/state/jetpack/credentials/actions';
import {
	hasJetpackCredentials,
	isRequestingJetpackCredentialsTest,
} from 'calypso/state/jetpack/credentials/selectors';

const request = ( siteId, role ) => ( dispatch, getState ) => {
	const hasCredentials = hasJetpackCredentials( getState(), siteId, role );

	if ( hasCredentials && ! isRequestingJetpackCredentialsTest( getState(), siteId, role ) ) {
		dispatch( testCredentials( siteId, role ) );
	}
};

function QueryJetpackCredentialsStatus( { siteId, role } ) {
	const dispatch = useDispatch();
	useEffect( () => {
		dispatch( request( siteId, role ) );
	}, [ dispatch, siteId, role ] );

	return null;
}

QueryJetpackCredentialsStatus.propTypes = {
	siteId: PropTypes.number.isRequired,
	role: PropTypes.string.isRequired,
};

export default QueryJetpackCredentialsStatus;
