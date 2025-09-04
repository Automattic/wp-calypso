import { DomainSearch } from '@automattic/domain-search';
import { ShoppingCartProvider, useShoppingCart } from '@automattic/shopping-cart';
import { useCallback, type ComponentProps } from 'react';
import { shoppingCartManagerClient } from 'calypso/dashboard/app/shopping-cart';
import { getPriceRuleForSuggestion } from './get-price-rule-for-suggestion';
import { useWPCOMShoppingCartForDomainSearch } from './use-wpcom-shopping-cart-for-domain-search';
import type { DomainSuggestion } from '@automattic/api-core';

type DomainSearchProps = Omit<
	ComponentProps< typeof DomainSearch >,
	'cart' | 'getPriceRuleForSuggestion'
> & {
	currentSiteId?: number;
	flowName: string;
};

const DomainSearchWithCart = ( { currentSiteId, flowName, ...props }: DomainSearchProps ) => {
	const cartKey = currentSiteId ?? 'no-site';

	const cart = useWPCOMShoppingCartForDomainSearch( {
		cartKey,
	} );

	const { responseCart } = useShoppingCart( cartKey );

	const memoizedGetPriceRuleForSuggestion = useCallback(
		( suggestion: DomainSuggestion ) => {
			return getPriceRuleForSuggestion( { suggestion, flowName, responseCart } );
		},
		[ responseCart, flowName ]
	);

	return (
		<DomainSearch
			{ ...props }
			getPriceRuleForSuggestion={ memoizedGetPriceRuleForSuggestion }
			cart={ cart }
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
