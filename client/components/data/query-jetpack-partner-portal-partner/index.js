/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPartner } from 'calypso/state/partner-portal/partner/actions';

export default function QueryJetpackPartnerPortalPartner() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchPartner );
	}, [ dispatch ] );

	return null;
}
