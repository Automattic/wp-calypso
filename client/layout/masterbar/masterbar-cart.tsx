/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useShoppingCart } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import MasterbarItem from './item';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import { getSelectedSite } from 'calypso/state/ui/selectors';

type MasterbarCartProps = { tooltip: string; children: React.ReactNode };

function MasterbarCart( { children, tooltip }: MasterbarCartProps ): JSX.Element | null {
	const { responseCart } = useShoppingCart();
	const selectedSite = useSelector( getSelectedSite );

	if ( ! selectedSite?.slug || responseCart.products.length < 1 ) {
		return null;
	}

	const checkoutUrl = `/checkout/${ selectedSite.slug }`;

	return (
		<div className="masterbar__cart">
			<MasterbarItem url={ checkoutUrl } icon="cart" tooltip={ tooltip }>
				{ children }
			</MasterbarItem>
		</div>
	);
}

export default function MasterBarCartWrapper( props: MasterbarCartProps ): JSX.Element {
	return (
		<CalypsoShoppingCartProvider>
			<MasterbarCart { ...props } />
		</CalypsoShoppingCartProvider>
	);
}
