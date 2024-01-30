import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActivePartnerKey } from 'calypso/state/partner-portal/partner/actions';
import {
	getCurrentPartner,
	hasActivePartnerKey,
	hasFetchedPartner,
	hasJetpackPartnerAccess as hasJetpackPartnerAccessSelector,
} from 'calypso/state/partner-portal/partner/selectors';

export const useQueryJetpackPartnerKey = () => {
	const hasJetpackPartnerAccess = useSelector( hasJetpackPartnerAccessSelector );
	const hasFetched = useSelector( hasFetchedPartner );
	const partner = useSelector( getCurrentPartner );
	const hasActiveKey = useSelector( hasActivePartnerKey );
	const dispatch = useDispatch();

	useEffect( () => {
		if ( ! hasJetpackPartnerAccess || ! hasFetched ) {
			return;
		}

		if ( partner && ! hasActiveKey && partner.keys.length > 0 ) {
			dispatch( setActivePartnerKey( partner.keys[ 0 ].id ) );
		}
	}, [ hasJetpackPartnerAccess, hasFetched, partner, hasActiveKey, dispatch ] );
};

const QueryJetpackPartnerKey = () => {
	useQueryJetpackPartnerKey();
	return null;
};

export default QueryJetpackPartnerKey;
