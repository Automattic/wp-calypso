import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart';
import React, { useMemo, useCallback } from 'react';
import ReactDom from 'react-dom';
import { MasterbarCart } from 'calypso/layout/masterbar/masterbar-cart';
import authWrapper from './auth-wrapper';
import type { RequestCart } from '@automattic/shopping-cart';

import 'calypso/layout/masterbar/style.scss';

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

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	return (
		<ShoppingCartProvider managerClient={ cartManagerClient }>
			<div className="masterbar-cart-standalone">
				<MasterbarCart selectedSiteSlug={ siteId } />
			</div>
		</ShoppingCartProvider>
	);
	/* eslint-enable */
}

const AppWithAuth = authWrapper( App );

async function AppBoot() {
	const urlParams = new URLSearchParams( window.location.search );
	const siteId = urlParams.get( 'site' );

	ReactDom.render(
		<AppWithAuth siteId={ siteId } />,
		document.getElementById( 'masterbar-cart-area' )
	);
}

AppBoot();
