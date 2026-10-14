import { useEffect, useState } from 'react';
import { getOriginalReturnUrl, getPressableReturnPath } from '../pressable-return/lib';
import type { ClientReturnContext } from '../pressable-return/lib';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export default function usePressableCheckoutReturn(
	products: ResponseCartProduct[],
	agencyId: number | undefined,
	isPreparedCart: boolean,
	isReady: boolean,
	clientContext?: ClientReturnContext
) {
	const [ context, setContext ] = useState< {
		agencyId: number;
		referralId?: number;
		clientId?: number;
		url: string;
	} >();
	const referralId = clientContext?.referralId;
	const clientId = clientContext?.clientId;
	const originalUrl =
		isPreparedCart && isReady && agencyId
			? getOriginalReturnUrl( products, agencyId, clientContext )
			: undefined;

	useEffect( () => {
		if ( ! agencyId ) {
			return;
		}
		if ( originalUrl ) {
			setContext( { agencyId, referralId, clientId, url: originalUrl } );
		} else if ( ! isPreparedCart || isReady ) {
			setContext( undefined );
		}
	}, [ agencyId, referralId, clientId, isPreparedCart, isReady, originalUrl ] );

	// Keep the original cart URL available if this checkout reports an error.
	const checkoutUrl =
		originalUrl ??
		( isPreparedCart &&
		! isReady &&
		context &&
		context.agencyId === agencyId &&
		context.referralId === referralId &&
		context.clientId === clientId
			? context.url
			: undefined );
	if ( ! agencyId || ! checkoutUrl ) {
		return {};
	}
	return {
		// A4A payment completion passes through the pending page on WordPress.com.
		successPath: `${ window.location.origin }${ getPressableReturnPath( agencyId, referralId ) }`,
		originalUrl: checkoutUrl,
	};
}
