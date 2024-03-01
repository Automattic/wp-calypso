import { MiniCart } from '@automattic/mini-cart';
import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import React, { useMemo, useCallback } from 'react';
import ReactDom from 'react-dom';
import { createClient } from './client';
import type { RequestCart } from '@automattic/shopping-cart';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function App( { siteId, wpcom }: { siteId: string; wpcom: any } ) {
	const wpcomGetCart = useCallback(
		( cartKey: string ) => wpcom.req.get( `/me/shopping-cart/${ cartKey }` ),
		[ wpcom ]
	);
	const wpcomSetCart = useCallback(
		( cartKey: string, cartData: RequestCart ) =>
			wpcom.req.post( `/me/shopping-cart/${ cartKey }`, cartData ),
		[ wpcom ]
	);

	const cartManagerClient = useMemo(
		() =>
			createShoppingCartManagerClient( {
				getCart: wpcomGetCart,
				setCart: wpcomSetCart,
			} ),
		[ wpcomGetCart, wpcomSetCart ]
	);

	const goToCheckout = ( siteSlug: string ) => {
		window.location.href = `/checkout/${ siteSlug }`;
	};

	const closeCart = () => {
		// eslint-disable-next-line no-console
		console.log( 'TODO: implement closing' );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<ShoppingCartProvider managerClient={ cartManagerClient }>
			<header id="masterbar" className="masterbar masterbar-cart-app">
				<MiniCart
					cartKey={ siteId }
					selectedSiteSlug={ siteId }
					goToCheckout={ goToCheckout }
					closeCart={ closeCart }
				/>
			</header>
		</ShoppingCartProvider>
	);
	/* eslint-enable */
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function init( wpcom: any ) {
	const urlParams = new URLSearchParams( window.location.search );
	const siteId = urlParams.get( 'site' );

	ReactDom.render(
		<App siteId={ siteId } wpcom={ wpcom } />,
		document.getElementById( 'masterbar-cart-area' )
	);
}

createClient().then( init );
