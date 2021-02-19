/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchLicenseCounts } from 'calypso/state/partner-portal/licenses/actions';

export default function QueryJetpackPartnerPortalLicenseCounts() {
	const dispatch = useDispatch();

	useEffect( () => {
		dispatch( fetchLicenseCounts() );
	}, [ dispatch ] );

	return null;
}
