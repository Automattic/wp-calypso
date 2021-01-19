/**
 * External dependencies
 */
import React from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPartner } from 'calypso/state/partner-portal/actions';

export default function QueryJetpackPartnerPortalPartner() {
	const dispatch = useDispatch();

	React.useEffect( () => {
		dispatch( fetchPartner() );
	}, [] );

	return null;
}
