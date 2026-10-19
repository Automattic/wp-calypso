import { useEffect, useState } from 'react';
import { getPressableReturnUrls } from './lib/pressable-return';
import type { PressableReturnUrls } from './lib/pressable-return';
import type { CartKey, ResponseCartProduct } from '@automattic/shopping-cart';

export default function usePressableCheckoutReturn(
	products: ResponseCartProduct[],
	agencyId: number | undefined,
	isPreparedCart: boolean,
	isReady: boolean,
	cartKey: CartKey
) {
	const [ context, setContext ] = useState<
		PressableReturnUrls & { agencyId: number; cartKey: CartKey }
	>();
	const { successUrl, cancelUrl } =
		( isPreparedCart && isReady && agencyId
			? getPressableReturnUrls( products, agencyId )
			: undefined ) ?? {};

	useEffect( () => {
		if ( ! agencyId || ! isPreparedCart || ( isReady && ! successUrl ) ) {
			setContext( undefined );
			return;
		}
		if ( successUrl && cancelUrl ) {
			setContext( { agencyId, cartKey, successUrl, cancelUrl } );
			return;
		}
		setContext( ( current ) =>
			current?.agencyId === agencyId && current.cartKey === cartKey ? current : undefined
		);
	}, [ agencyId, cartKey, isPreparedCart, isReady, successUrl, cancelUrl ] );

	if ( ! isPreparedCart || ! agencyId ) {
		return {};
	}
	if ( successUrl && cancelUrl ) {
		return { successUrl, cancelUrl };
	}
	if (
		isReady &&
		products.some( ( { extra } ) => 'titan_domain' in extra || 'pressableCancelUrl' in extra )
	) {
		return { isInvalid: true };
	}
	// Cart clearing and load errors must not discard this checkout's destinations.
	if ( ! isReady && context?.agencyId === agencyId && context.cartKey === cartKey ) {
		return { successUrl: context.successUrl, cancelUrl: context.cancelUrl };
	}
	return {};
}
