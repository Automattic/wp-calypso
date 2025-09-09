import { DomainSearch } from '@automattic/domain-search';
import { ResponseCartProduct, ShoppingCartProvider } from '@automattic/shopping-cart';
import { useMemo, type ComponentProps } from 'react';
import { shoppingCartManagerClient } from 'calypso/dashboard/app/shopping-cart';
import { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';

type DomainSearchProps = Omit< ComponentProps< typeof DomainSearch >, 'cart' | 'events' > & {
	currentSiteId?: number;
	flowName: string;
	events?: Omit< Required< ComponentProps< typeof DomainSearch > >[ 'events' ], 'onContinue' > & {
		onContinue?: ( items: ResponseCartProduct[] ) => void;
	};
};

const DomainSearchWithCart = ( {
	currentSiteId,
	flowName,
	config: externalConfig,
	...props
}: DomainSearchProps ) => {
	const cartKey = currentSiteId ?? 'no-site';

	const { cart, isNextDomainFree, items } = useWPCOMShoppingCartForDomainSearch( {
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

	const events = useMemo( () => {
		return {
			...props.events,
			onContinue: () => {
				props.events?.onContinue?.( items );
			},
		};
	}, [ props.events, items ] );

	return <DomainSearch { ...props } config={ config } cart={ cart } events={ events } />;
};

export const WPCOMDomainSearch = ( props: DomainSearchProps ) => {
	return (
		<ShoppingCartProvider managerClient={ shoppingCartManagerClient }>
			<DomainSearchWithCart { ...props } />
		</ShoppingCartProvider>
	);
};
