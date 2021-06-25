/**
 * External dependencies
 */
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import { fetchPartner } from 'calypso/state/partner-portal/partner/actions';
import { hasFetchedPartner } from 'calypso/state/partner-portal/partner/selectors';

export default function QueryJetpackPartnerPortalPartner() {
	const dispatch = useDispatch();
	const hasFetched = useSelector( hasFetchedPartner );

	useEffect( () => {
		if ( ! hasFetched ) {
			dispatch( fetchPartner );
		}
	}, [ hasFetched, dispatch ] );

	return null;
}
