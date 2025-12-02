import type { StoredPaymentMethod, StoredPaymentMethodCard } from '@automattic/api-core';

export function isCreditCard( item: StoredPaymentMethod ): item is StoredPaymentMethodCard {
	if ( ! ( 'card_type' in item ) ) {
		return false;
	}
	if ( ! item.card_type ) {
		return false;
	}
	return true;
}
