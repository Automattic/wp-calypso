import { ShoppingCartProvider, createShoppingCartManagerClient } from '@automattic/shopping-cart'; // eslint-disable-line
import { wpcomGetCart, wpcomSetCart } from '../../data/me-shopping-cart';
import type { ReactNode } from 'react';

const cartManagerClient = createShoppingCartManagerClient( {
	getCart: wpcomGetCart,
	setCart: wpcomSetCart,
} );

const options = {
	refetchOnWindowFocus: true,
};

const DashboardShoppingCartProvider = ( { children }: { children: ReactNode } ) => (
	<ShoppingCartProvider managerClient={ cartManagerClient } options={ options }>
		{ children }
	</ShoppingCartProvider>
);

export default DashboardShoppingCartProvider;
