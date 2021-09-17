import { ShoppingCartProvider } from '@automattic/shopping-cart';
import React from 'react';
import ReactDom from 'react-dom';
import { MasterbarCart } from 'calypso/layout/masterbar/masterbar-cart';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';

async function AppBoot() {
	ReactDom.render(
		<ShoppingCartProvider managerClient={ cartManagerClient }>
			<MasterbarCart selectedSiteSlug={ window.location.search } />
		</ShoppingCartProvider>,
		document.getElementById( 'masterbar-cart-area' )
	);
}

AppBoot();
