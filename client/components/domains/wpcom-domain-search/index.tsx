import { DomainSearch } from '@automattic/domain-search';
import { ShoppingCartProvider } from '@automattic/shopping-cart';
import { useMemo, type ComponentProps } from 'react';
import { shoppingCartManagerClient } from 'calypso/dashboard/app/shopping-cart';
import { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';

type DomainSearchProps = Omit< ComponentProps< typeof DomainSearch >, 'cart' > & {
	currentSiteId?: number;
	flowName: string;
};

const DomainSearchWithCart = ( {
	currentSiteId,
	flowName,
	config: externalConfig,
	...props
}: DomainSearchProps ) => {
	const cartKey = currentSiteId ?? 'no-site';

	const { cart, isNextDomainFree } = useWPCOMShoppingCartForDomainSearch( {
		cartKey,
		flowName,
	} );

	const config = useMemo( () => {
		return {
			...externalConfig,
			priceRules: {
				...externalConfig?.priceRules,
				freeForFirstYear: isNextDomainFree,
			},
		};
	}, [ externalConfig, isNextDomainFree ] );

	return <DomainSearch { ...props } config={ config } cart={ cart } />;
};

export const WPCOMDomainSearch = ( props: DomainSearchProps ) => {
	return (
		<ShoppingCartProvider managerClient={ shoppingCartManagerClient }>
			<DomainSearchWithCart { ...props } />
		</ShoppingCartProvider>
	);
};
