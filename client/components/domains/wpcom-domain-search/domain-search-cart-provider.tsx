import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { shoppingCartManagerClient } from 'calypso/dashboard/app/shopping-cart';

const OPTIONS = {
	refetchOnWindowFocus: true,
};

export const WPCOMDomainSearchCartProvider = ( { children }: { children: React.ReactNode } ) => {
	return (
		<ShoppingCartProvider managerClient={ shoppingCartManagerClient } options={ OPTIONS }>
			{ children }
		</ShoppingCartProvider>
	);
};
