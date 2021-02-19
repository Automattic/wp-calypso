/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchLicenses } from 'calypso/state/partner-portal/licenses/actions';

export default function QueryJetpackPartnerPortalLicenses() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchLicenses );
	}, [ dispatch ] );

	return null;
}
