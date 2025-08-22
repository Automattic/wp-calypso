import type { Purchase } from '../../data/purchase';

export function getPurchaseUrl( purchase: Purchase ) {
	return getPurchaseUrlForId( purchase.ID );
}

export function getPurchaseUrlForId( id: number | string ) {
	if ( ! id ) {
		// eslint-disable-next-line no-console
		console.error( 'Cannot display manage purchase page for subscription without ID' );
		throw new Error( 'Cannot display manage purchase page for subscription without ID' );
	}
	return `/me/billing/purchases/purchase/${ id }`;
}

export function getAddPaymentMethodUrlFor( purchase: Purchase ): string {
	return `/me/purchases/${ purchase.site_slug ?? 'unknown' }/${ purchase.ID }/payment-method/add`;
}
