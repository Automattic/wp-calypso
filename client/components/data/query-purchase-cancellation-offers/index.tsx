import * as React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCancellationOffers } from 'calypso/state/cancellation-offers/actions';
import isFetchingCancellationOffers from 'calypso/state/cancellation-offers/selectors/is-fetching-cancellation-offers';

interface OwnProps {
	siteId?: number;
	purchaseId?: number;
	ownershipId?: number;
}

const QueryPurchaseCancellationOffers: React.FC< OwnProps > = ( {
	siteId,
	purchaseId,
	ownershipId,
} ) => {
	const dispatch = useDispatch();

	const fetchingCancellationOffers = useSelector( ( state ) =>
		isFetchingCancellationOffers( state, purchaseId )
	);

	useEffect( () => {
		if ( siteId && fetchingCancellationOffers === null ) {
			dispatch( fetchCancellationOffers( siteId, purchaseId, ownershipId ) );
		}
	}, [ dispatch, fetchingCancellationOffers, siteId ] );

	return null;
};

export default QueryPurchaseCancellationOffers;
