import type { ResponseCartProduct } from '@automattic/shopping-cart';

export type PressableReturnUrls = { successUrl: string; cancelUrl: string };

function isPressableReturnUrl(
	value: unknown,
	agencyId: number,
	status: 'SUCCESS' | 'CANCELED'
): value is string {
	if ( typeof value !== 'string' ) {
		return false;
	}
	try {
		const url = new URL( value );
		if (
			url.origin !== 'https://my.pressable.com' ||
			url.pathname !== '/titan_email/checkout_return' ||
			url.username ||
			url.password ||
			url.hash
		) {
			return false;
		}
		const query = url.searchParams;
		return (
			query.getAll( 'agency_id' ).length === 1 &&
			Number( query.get( 'agency_id' ) ) === agencyId &&
			query.getAll( 'checkout_status' ).length === 1 &&
			query.get( 'checkout_status' ) === status &&
			query.getAll( 'signature' ).length === 1 &&
			!! query.get( 'signature' )
		);
	} catch {
		return false;
	}
}

export function getPressableReturnUrls(
	products: { extra?: ResponseCartProduct[ 'extra' ] }[],
	agencyId: number
): PressableReturnUrls | undefined {
	if ( products.length !== 1 ) {
		return;
	}
	const { extra } = products[ 0 ];
	if ( ! extra?.isA4ASitelessCheckout || Number( extra.agency_id ) !== agencyId ) {
		return;
	}
	if (
		! ( 'titan_domain' in extra ) ||
		typeof extra.titan_domain !== 'string' ||
		! extra.titan_domain
	) {
		return;
	}
	if (
		! ( 'titan_plan' in extra ) ||
		( extra.titan_plan !== 'standard' && extra.titan_plan !== 'premium' )
	) {
		return;
	}
	if (
		! isPressableReturnUrl( extra.afterPurchaseUrl, agencyId, 'SUCCESS' ) ||
		! ( 'pressableCancelUrl' in extra ) ||
		! isPressableReturnUrl( extra.pressableCancelUrl, agencyId, 'CANCELED' )
	) {
		return;
	}
	return { successUrl: extra.afterPurchaseUrl, cancelUrl: extra.pressableCancelUrl };
}
