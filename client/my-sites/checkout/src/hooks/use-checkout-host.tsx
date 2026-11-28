import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import type { User } from '@automattic/api-core';
import type { CartKey } from '@automattic/shopping-cart';

interface CheckoutHost {
	cartKey: CartKey;
	siteId: number | null;
	user: User | null;
}

const CheckoutHostContext = createContext< CheckoutHost | null >( null );

/**
 * Provides what the page hosting checkout knows and checkout needs: the key of
 * the cart, the site the purchase is for, and the logged-in user.
 *
 * The host decides these; checkout does not work them out itself. Before,
 * checkout read them from Calypso's Redux store (the selected site and the
 * current user) and from `window.location` (through `useCartKey()`), which tied
 * it to the Calypso page it was on. That breaks when checkout is rendered
 * somewhere else, like a modal on another page or a client without Calypso's
 * Redux store: hosts like `PurchaseModal` have had to dispatch
 * `setSelectedSiteId` just so checkout would see the right site and cart.
 *
 * `CheckoutMain` renders this provider from its props. Anything else that
 * renders checkout components outside `CheckoutMain` (the checkout masterbar,
 * `PurchaseModal`) must render this provider itself.
 */
export function CheckoutHostProvider( {
	cartKey,
	siteId,
	user,
	children,
}: PropsWithChildren< {
	cartKey: CartKey;
	siteId: number | null | undefined;
	user: User | null | undefined;
} > ) {
	const value = useMemo(
		() => ( { cartKey, siteId: siteId || null, user: user ?? null } ),
		[ cartKey, siteId, user ]
	);
	return <CheckoutHostContext.Provider value={ value }>{ children }</CheckoutHostContext.Provider>;
}

function useCheckoutHost(): CheckoutHost {
	const host = useContext( CheckoutHostContext );
	// Throws rather than guessing, because a guessed cart key or site would
	// quietly read or change the wrong cart or site.
	if ( ! host ) {
		throw new Error( 'Checkout hooks must be used inside a CheckoutHostProvider' );
	}
	return host;
}

/**
 * Returns the key of the cart that checkout is working on, as decided by the
 * page hosting checkout.
 *
 * Use this instead of `useCartKey()` in any code that checkout renders, so the
 * key always matches the cart the host gave to `CheckoutMain`. `useCartKey()`
 * works it out again from Redux and the URL, which can disagree with the host:
 * for example, A4A checkout uses its own site ID before the Redux selected site
 * is updated.
 */
export function useCheckoutCartKey(): CartKey {
	return useCheckoutHost().cartKey;
}

/**
 * Returns the ID of the site the purchase is for, or `null` for a siteless
 * purchase. In a logged-out checkout that creates a site before the
 * transaction, this is the new site once it exists.
 *
 * Use this instead of the Redux selected site in any code that checkout
 * renders.
 */
export function useCheckoutSiteId(): number | null {
	return useCheckoutHost().siteId;
}

/**
 * Returns the logged-in user, or `null` when checkout is logged out.
 *
 * Use this instead of the Redux current user in any code that checkout
 * renders.
 */
export function useCheckoutUser(): User | null {
	return useCheckoutHost().user;
}
