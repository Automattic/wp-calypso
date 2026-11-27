import { useSelector } from 'calypso/state';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { CheckoutHostProvider } from './src/hooks/use-checkout-host';
import useCartKey from './use-cart-key';
import type { PropsWithChildren } from 'react';

/**
 * Renders `CheckoutHostProvider` with the cart, site and user of the current
 * Calypso page, for Calypso pages that render checkout components outside
 * `CheckoutMain`.
 */
export default function CalypsoCheckoutHostProvider( { children }: PropsWithChildren ) {
	const cartKey = useCartKey();
	const siteId = useSelector( getSelectedSiteId );
	const user = useSelector( getCurrentUser );
	return (
		<CheckoutHostProvider cartKey={ cartKey } siteId={ siteId } user={ user }>
			{ children }
		</CheckoutHostProvider>
	);
}
