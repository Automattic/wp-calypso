import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPartner } from 'calypso/state/partner-portal/partner/actions';
import { hasFetchedPartner } from 'calypso/state/partner-portal/partner/selectors';

export const useQueryJetpackPartnerPortalPartner = () => {
	const dispatch = useDispatch();
	const hasFetched = useSelector( hasFetchedPartner );

	useEffect( () => {
		if ( ! hasFetched ) {
			dispatch( fetchPartner() );
		}
	}, [ hasFetched, dispatch ] );
};

export default function QueryJetpackPartnerPortalPartner() {
	useQueryJetpackPartnerPortalPartner();

	return null;
}
