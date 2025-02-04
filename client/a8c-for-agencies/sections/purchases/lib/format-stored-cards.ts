import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';

export default function formatStoredCards( data: {
	items: PaymentMethod[];
	per_page: number;
	has_more: boolean;
} ) {
	const allStoredCards = data.items ?? [];
	return {
		allStoredCards,
		primaryStoredCard: allStoredCards.find( ( card ) => card.is_default ) ?? null,
		secondaryStoredCards: allStoredCards.filter( ( card ) => ! card.is_default ),
		pageSize: data.per_page ?? 0,
		hasStoredCards: allStoredCards.length > 0,
		hasMoreStoredCards: data.has_more ?? false,
	};
}
