import { DomainSearch } from '@automattic/domain-search';
import { ResponseCartProduct } from '@automattic/shopping-cart';
import { useMemo, type ComponentProps } from 'react';
import { WPCOMDomainSearchCartProvider } from './domain-search-cart-provider';
import { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';

type DomainSearchProps = Omit< ComponentProps< typeof DomainSearch >, 'cart' | 'events' > & {
	currentSiteId?: number;
	flowName: string;
	events?: Omit< Required< ComponentProps< typeof DomainSearch > >[ 'events' ], 'onContinue' > & {
		onContinue?: ( items: ResponseCartProduct[] ) => void;
	};
	isFirstDomainFreeForFirstYear?: boolean;
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
	currentSiteUrl,
	flowName,
	initialQuery: externalInitialQuery,
	config: externalConfig,
	isFirstDomainFreeForFirstYear,
	...props
}: DomainSearchProps ) => {
	const cartKey = currentSiteId ?? 'no-site';

	const { cart, isNextDomainFree, items } = useWPCOMShoppingCartForDomainSearch( {
		cartKey,
		flowName,
		isFirstDomainFreeForFirstYear: isFirstDomainFreeForFirstYear ?? false,
	} );

	const initialQuery = useMemo( () => {
		return externalInitialQuery || currentSiteUrl || getInitialQuery();
	}, [ externalInitialQuery, currentSiteUrl ] );

	const cartItemsLength = cart.items.length;

	const config = useMemo( () => {
		return {
			...externalConfig,
			priceRules: {
				...externalConfig?.priceRules,
				freeForFirstYear:
					( cartItemsLength === 0 && isFirstDomainFreeForFirstYear ) || isNextDomainFree,
			},
		};
	}, [ externalConfig, isNextDomainFree, cartItemsLength, isFirstDomainFreeForFirstYear ] );

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
			currentSiteUrl={ currentSiteUrl }
			config={ config }
			cart={ cart }
			events={ events }
			initialQuery={ initialQuery }
		/>
	);
};

export const WPCOMDomainSearch = ( props: DomainSearchProps ) => {
	return (
		<WPCOMDomainSearchCartProvider>
			<DomainSearchWithCart { ...props } />
		</WPCOMDomainSearchCartProvider>
	);
};
