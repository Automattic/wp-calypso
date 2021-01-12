/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPartners } from 'calypso/state/partner-portal/actions';

export default function QueryJetpackPartnerPortalPartners() {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( fetchPartners() );
	}, [] );

	return null;
}
