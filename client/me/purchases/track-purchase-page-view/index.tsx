import { purchaseQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

export default function TrackPurchasePageView( {
	purchaseId,
	eventName,
}: {
	purchaseId: number;
	eventName: string;
} ) {
	const reduxDispatch = useDispatch();
	const { data: purchase } = useQuery( purchaseQuery( purchaseId ) );
	const productSlug = purchase?.product_slug;

	useEffect( () => {
		if ( productSlug && eventName ) {
			reduxDispatch( recordTracksEvent( eventName, { product_slug: productSlug } ) );
		}
	}, [ reduxDispatch, eventName, productSlug ] );

	return null;
}
