import { useEffect, useState } from 'react';
import {
	clearOriginalReturnUrl,
	getOriginalReturnUrl,
	getPressableReturnPath,
	storeOriginalReturnUrl,
} from '../pressable-return/lib';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export default function usePressableReturnPaths(
	products: ResponseCartProduct[],
	agencyId: number | undefined,
	isPreparedCart: boolean,
	isReady: boolean
) {
	const [ previousUrl, setPreviousUrl ] = useState< string >();
	const originalUrl =
		isPreparedCart && isReady && agencyId ? getOriginalReturnUrl( products, agencyId ) : undefined;

	useEffect( () => {
		if ( ! agencyId ) {
			return;
		}
		if ( originalUrl ) {
			setPreviousUrl( originalUrl );
			storeOriginalReturnUrl( agencyId, originalUrl );
		} else if ( ! isPreparedCart || isReady ) {
			setPreviousUrl( undefined );
			clearOriginalReturnUrl( agencyId );
		}
	}, [ agencyId, isPreparedCart, isReady, originalUrl ] );

	// Removing the last item clears the cart before the existing checkout hook navigates.
	const hasReturnUrl = originalUrl || ( isPreparedCart && ! products.length && previousUrl );
	if ( ! agencyId || ! hasReturnUrl ) {
		return {};
	}
	return {
		// A4A payment completion passes through the pending page on WordPress.com.
		successPath: `${ window.location.origin }${ getPressableReturnPath( agencyId ) }`,
		cancelPath: getPressableReturnPath( agencyId, true ),
	};
}
