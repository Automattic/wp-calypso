import { createContext, useContext, type PropsWithChildren } from 'react';
import type { CartKey } from '@automattic/shopping-cart';

const CheckoutCartKeyContext = createContext< CartKey | null >( null );

/**
 * Provides the key of the cart that checkout reads and changes.
 *
 * The page that hosts checkout decides the key; checkout does not work it out
 * itself. `useCartKey()` derives the key from the Redux selected site, the
 * logged-in state and `window.location`, which ties checkout to Calypso's
 * Redux store and to the URL of the page it's on. That breaks when checkout is
 * rendered somewhere else, like a modal on another page or a client without
 * Calypso's Redux store: hosts like `PurchaseModal` have had to dispatch
 * `setSelectedSiteId` just so `useCartKey()` would return the right key.
 *
 * `CheckoutMain` renders this provider with its `cartKey` prop. Anything else
 * that renders checkout components outside `CheckoutMain` (the checkout
 * masterbar, `PurchaseModal`) must render this provider itself.
 */
export function CheckoutCartKeyProvider( {
	cartKey,
	children,
}: PropsWithChildren< { cartKey: CartKey } > ) {
	return (
		<CheckoutCartKeyContext.Provider value={ cartKey }>
			{ children }
		</CheckoutCartKeyContext.Provider>
	);
}

/**
 * Returns the key of the cart that checkout is working on, as decided by the
 * page hosting checkout through `CheckoutCartKeyProvider`.
 *
 * Use this instead of `useCartKey()` in any code that checkout renders, so the
 * key always matches the cart the host gave to `CheckoutMain`. `useCartKey()`
 * works it out again from Redux and the URL, which can disagree with the host:
 * for example, A4A checkout uses its own site ID before the Redux selected site
 * is updated.
 *
 * Throws when there is no provider, because guessing a key would quietly read
 * or change the wrong cart.
 */
export default function useCheckoutCartKey(): CartKey {
	const cartKey = useContext( CheckoutCartKeyContext );
	if ( cartKey === null ) {
		throw new Error( 'useCheckoutCartKey must be used inside a CheckoutCartKeyProvider' );
	}
	return cartKey;
}
