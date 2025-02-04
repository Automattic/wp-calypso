import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import getIntroOfferRequestStatus from 'calypso/state/selectors/get-intro-offers-request-status';
import { fetchIntroOffers } from 'calypso/state/sites/intro-offers/actions';

interface OwnProps {
	siteId?: number | 'none';
	currency?: string;
}

const QueryIntroOffers: React.FC< OwnProps > = ( { siteId, currency } ) => {
	const dispatch = useDispatch();
	const siteIdKey = siteId && typeof siteId === 'number' && siteId > 0 ? siteId : 'none';

	const introOfferRequestStatus = useSelector( ( state ) =>
		getIntroOfferRequestStatus( state, siteIdKey )
	);

	useEffect( () => {
		if ( introOfferRequestStatus === null ) {
			dispatch( fetchIntroOffers( siteIdKey, currency ) );
		}
	}, [ dispatch, introOfferRequestStatus, siteIdKey, currency ] );

	return null;
};

export default QueryIntroOffers;
