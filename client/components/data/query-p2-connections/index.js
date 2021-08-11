/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
/**
 * Internal dependencies
 */
import { requestP2KeyringConnections } from 'calypso/state/sharing/keyring/actions';
import { isKeyringConnectionsFetching } from 'calypso/state/sharing/keyring/selectors';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( ! isKeyringConnectionsFetching( getState(), siteId ) ) {
		dispatch( requestP2KeyringConnections( siteId ) );
	}
};

export default function QueryP2Connections( { siteId } ) {
	const dispatch = useDispatch();

	useEffect( () => {
		if ( siteId ) {
			dispatch( request( siteId ) );
		}
	}, [ dispatch, siteId ] );

	return null;
}

QueryP2Connections.propTypes = {
	siteId: PropTypes.number.isRequired,
};
