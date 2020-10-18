/**
 * External dependencies
 */
import { useEffect, useRef } from 'react';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { ReloadCartFromServer } from './types';

const debug = debugFactory( 'shopping-cart:use-reload-cart-if-cart-key-changes' );

export default function useReloadCartIfCartKeyChanges(
	cartKey: string | number | null | undefined,
	reloadFromServer: ReloadCartFromServer
): void {
	const previousCartKey = useRef( cartKey );
	useEffect( () => {
		if ( cartKey && cartKey !== previousCartKey.current ) {
			debug(
				`cart key "${ cartKey }" has changed from "${ previousCartKey.current }"; reloading cart`
			);
			previousCartKey.current = cartKey;
			reloadFromServer();
		}
	}, [ cartKey, reloadFromServer ] );
}
