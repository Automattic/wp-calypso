import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import getIntroOfferRequestStatus from 'calypso/state/selectors/get-intro-offers-request-status';
import { fetchIntroOffers } from 'calypso/state/sites/intro-offers/actions';

interface OwnProps {
	siteId?: number;
}

const QueryIntroOffers: React.FC< OwnProps > = ( { siteId } ) => {
	const dispatch = useDispatch();
	const introOfferRequestStatus = useSelector( ( state ) =>
		siteId ? getIntroOfferRequestStatus( state, siteId ) : null
	);

	useEffect( () => {
		if ( introOfferRequestStatus === null && siteId !== undefined ) {
			dispatch( fetchIntroOffers( siteId ) );
		}
	}, [ dispatch, introOfferRequestStatus, siteId ] );

	return null;
};

export default QueryIntroOffers;
