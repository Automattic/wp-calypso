import { ShoppingCartProvider } from '@automattic/shopping-cart';
import React from 'react';
import ReactDom from 'react-dom';
import { MasterbarCart } from 'calypso/layout/masterbar/masterbar-cart';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';

async function AppBoot() {
	const urlParams = new URLSearchParams( window.location.search );
	const siteId = urlParams.get( 'site' );

	ReactDom.render(
		<ShoppingCartProvider managerClient={ cartManagerClient }>
			<MasterbarCart selectedSiteSlug={ siteId } />
		</ShoppingCartProvider>,
		document.getElementById( 'masterbar-cart-area' )
	);
}

AppBoot();
