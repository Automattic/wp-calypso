/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchLicenseCounts } from 'calypso/state/partner-portal/licenses/actions';
import { getActivePartnerKeyId } from 'calypso/state/partner-portal/partner/selectors';

export default function QueryJetpackPartnerPortalLicenseCounts() {
	const dispatch = useDispatch();
	const activeKeyId = useSelector( getActivePartnerKeyId );

	useEffect( () => {
		// Key switching for requests is already done for us - we use keyId just to re-trigger the request.
		dispatch( fetchLicenseCounts() );
	}, [ dispatch, activeKeyId ] );

	return null;
}
