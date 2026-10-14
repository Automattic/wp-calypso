import { useEffect, useState } from 'react';
import { getOriginalReturnUrl, getPressableReturnPath } from '../pressable-return/lib';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export default function usePressableCheckoutReturn(
	products: ResponseCartProduct[],
	agencyId: number | undefined,
	isPreparedCart: boolean,
	isReady: boolean
) {
	const [ context, setContext ] = useState< { agencyId: number; url: string } >();
	const originalUrl =
		isPreparedCart && isReady && agencyId ? getOriginalReturnUrl( products, agencyId ) : undefined;

	useEffect( () => {
		if ( ! agencyId ) {
			return;
		}
		if ( originalUrl ) {
			setContext( { agencyId, url: originalUrl } );
		} else if ( ! isPreparedCart || isReady ) {
			setContext( undefined );
		}
	}, [ agencyId, isPreparedCart, isReady, originalUrl ] );

	// Keep the original cart URL available if this checkout reports an error.
	const checkoutUrl =
		originalUrl ??
		( isPreparedCart && ! isReady && context && context.agencyId === agencyId
			? context.url
			: undefined );
	if ( ! agencyId || ! checkoutUrl ) {
		return {};
	}
	return {
		// A4A payment completion passes through the pending page on WordPress.com.
		successPath: `${ window.location.origin }${ getPressableReturnPath( agencyId ) }`,
		originalUrl: checkoutUrl,
	};
}
