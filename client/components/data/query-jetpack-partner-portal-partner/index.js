/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPartner } from 'calypso/state/partner-portal/actions';

export default function QueryJetpackPartnerPortalPartner() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchPartner );
	}, [ dispatch ] );

	return null;
}
