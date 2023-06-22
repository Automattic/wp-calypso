import { useEffect } from 'react';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCancellationOffers } from 'calypso/state/cancellation-offers/actions';
import isFetchingCancellationOffers from 'calypso/state/cancellation-offers/selectors/is-fetching-cancellation-offers';

interface OwnProps {
	siteId: number;
	purchaseId: number;
}

const QueryPurchaseCancellationOffers = ( { siteId, purchaseId }: OwnProps ) => {
	const dispatch = useDispatch();

	const fetchingCancellationOffers = useSelector( ( state ) =>
		isFetchingCancellationOffers( state, purchaseId )
	);

	useEffect( () => {
		if ( siteId && fetchingCancellationOffers === null ) {
			dispatch( fetchCancellationOffers( siteId, purchaseId ) );
		}
	}, [ dispatch, fetchingCancellationOffers, siteId, purchaseId ] );

	return null;
};

export default QueryPurchaseCancellationOffers;
