import { isEnabled } from '@automattic/calypso-config';
import { useEffect, useState } from 'react';
import { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

// FIXME: Need to hook this up to the real API.
export default function useStoredCards() {
	const showDummyData = isEnabled( 'a4a/mock-api-data' );

	const [ isFetching, setIsFetching ] = useState( showDummyData );

	useEffect( () => {
		// Simulate a fake loading delay.
		setTimeout( () => {
			setIsFetching( false );
		}, 1000 );
	}, [] );

	if ( showDummyData ) {
		const allStoredCards: PaymentMethod[] = [
			{
				id: '1',
				card: {
					brand: 'mastercard',
					exp_month: 12,
					exp_year: 2027,
					last4: '1234',
				},
				is_default: true,
				name: 'Primary Card',
				created: new Date().toString(),
			},
		];

		return {
			allStoredCards,
			primaryStoredCard: allStoredCards.find( ( card ) => card.is_default ),
			secondaryStoredCards: allStoredCards.filter( ( card ) => ! card.is_default ),
			isFetching,
			pageSize: 1,
			hasStoredCards: !! allStoredCards.length,
			hasMoreStoredCards: false,
		};
	}

	return {
		allStoredCards: [],
		primaryStoredCard: null,
		secondaryStoredCards: [],
		isFetching,
		pageSize: 0,
		hasStoredCards: false,
		hasMoreStoredCards: false,
	};
}
