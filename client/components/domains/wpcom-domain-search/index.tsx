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

const SESSION_STORAGE_QUERY_KEY = 'domain-search-query';

const getInitialQuery = () => {
	try {
		return sessionStorage.getItem( SESSION_STORAGE_QUERY_KEY ) ?? '';
	} catch {
		return '';
	}
};

const setInitialQuery = ( query: string ) => {
	sessionStorage.setItem( SESSION_STORAGE_QUERY_KEY, query );
};

const DomainSearchWithCart = ( {
	currentSiteId,
	flowName,
	initialQuery: externalInitialQuery,
	config: externalConfig,
	...props
}: DomainSearchProps ) => {
	const cartKey = currentSiteId ?? 'no-site';

	const { cart, isNextDomainFree, items } = useWPCOMShoppingCartForDomainSearch( {
		cartKey,
		flowName,
	} );

	const initialQuery = useMemo( () => {
		return externalInitialQuery ?? getInitialQuery();
	}, [ externalInitialQuery ] );

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
			onQueryChange: ( query: string ) => {
				setInitialQuery( query );
			},
			onContinue: () => {
				props.events?.onContinue?.( items );
			},
		};
	}, [ props.events, items ] );

	return (
		<DomainSearch
			{ ...props }
			config={ config }
			cart={ cart }
			events={ events }
			initialQuery={ initialQuery }
		/>
	);
};

export const WPCOMDomainSearch = ( props: DomainSearchProps ) => {
	return (
		<ShoppingCartProvider managerClient={ shoppingCartManagerClient }>
			<DomainSearchWithCart { ...props } />
		</ShoppingCartProvider>
	);
};
