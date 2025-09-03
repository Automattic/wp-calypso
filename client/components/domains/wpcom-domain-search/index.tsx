import { DomainSearch } from '@automattic/domain-search';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { shoppingCartManagerClient } from 'calypso/dashboard/app/shopping-cart';
import { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';
import type { ComponentProps } from 'react';

type DomainSearchProps = Omit< ComponentProps< typeof DomainSearch >, 'cart' > & {
	currentSiteId?: number;
};

function DomainSearchWithCart( { currentSiteId, ...props }: DomainSearchProps ) {
	const cart = useWPCOMShoppingCartForDomainSearch( {
		cartKey: currentSiteId ?? 'no-site',
	} );

	return <DomainSearch { ...props } cart={ cart } />;
}

export const WPCOMDomainSearch = ( props: DomainSearchProps ) => {
	return (
		<ShoppingCartProvider managerClient={ shoppingCartManagerClient }>
			<DomainSearchWithCart { ...props } />
		</ShoppingCartProvider>
	);
};
