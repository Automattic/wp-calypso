import { isEnabled } from '@automattic/calypso-config';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import isRequestingSiteConnectionStatus from 'calypso/state/selectors/is-requesting-site-connection-status';
import {
	requestConnectionStatus,
	requestConnectionStatusV2,
} from 'calypso/state/site-connection/actions';

const request = ( siteId ) => ( dispatch, getState ) => {
	if ( siteId && ! isRequestingSiteConnectionStatus( getState(), siteId ) ) {
		// Existing Jetpack Error UX in the sidebar is enabled only for non-Atomic Jetpack sites, and we may
		// enable it for all Jetpack sites at some point. For now, we want to use new API endpoint.
		const isJetpackErrorUxEnabled = isEnabled( 'yolo/jetpack-error-ux-i1' );
		if ( isJetpackErrorUxEnabled ) {
			dispatch( requestConnectionStatusV2( siteId ) );
		} else {
			dispatch( requestConnectionStatus( siteId ) );
		}
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
