import {
	DomainSearch,
	type DomainSearchCart,
	DomainsMiniCart,
	DomainsFullCart,
} from '@automattic/domain-search';
import { formatCurrency } from '@automattic/number-formatters';
import { useShoppingCart } from '@automattic/shopping-cart';
import {
	__experimentalVStack as VStack,
	// eslint-disable-next-line wpcalypso/no-unsafe-wp-apis
	__experimentalView as View,
	__experimentalSpacer as Spacer,
} from '@wordpress/components';
import { useMemo } from 'react';
import { getDomainsInCart } from 'calypso/lib/cart-values/cart-items';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import { FreeDomainForAYearPromo } from './free-domain-for-a-year-promo';
import { HundredYearPromo } from './hundred-year-promo';

import './style.scss';

const DomainCartV2 = ( { onContinue }: { onContinue: () => void } ) => {
	const cartKey = useCartKey();
	const { responseCart, removeProductFromCart } = useShoppingCart( cartKey );

	const cart = useMemo( () => {
		const domainsInCart = getDomainsInCart( responseCart );

		const total = formatCurrency(
			domainsInCart.reduce( ( total, item ) => total + item.item_subtotal_integer, 0 ),
			responseCart.currency ?? 'USD',
			{
				isSmallestUnit: true,
				stripZeros: true,
			}
		);

		return {
			items: domainsInCart.map( ( domain ) => {
				const [ domainName, ...tld ] = domain.meta.split( '.' );

				const hasPromotion = domain.cost_overrides?.some(
					( override ) => ! override.does_override_original_cost
				);

				return {
					uuid: domain.uuid,
					domain: domainName,
					tld: tld.join( '.' ),
					originalPrice: hasPromotion
						? formatCurrency( domain.item_original_cost_integer, domain.currency, {
								isSmallestUnit: true,
								stripZeros: true,
						  } )
						: undefined,
					price: formatCurrency( domain.item_subtotal_integer, domain.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
				};
			} ),
			total,
			onAddItem: () => {},
			onRemoveItem: ( uuid ) => {
				removeProductFromCart( uuid );
			},
			hasItem: ( uuid ) => {
				return responseCart.products.some( ( item ) => item.uuid === uuid );
			},
		} satisfies DomainSearchCart;
	}, [ responseCart, removeProductFromCart ] );

	return (
		<DomainSearch onContinue={ onContinue } cart={ cart }>
			<DomainsMiniCart className="domains-search-v2__mini-cart" />
			<DomainsFullCart className="domains-search-v2__full-cart">
				<VStack spacing={ 6 }>
					<FreeDomainForAYearPromo />
					<DomainsFullCart.Items />
					<View>
						<Spacer marginTop={ 4 }>
							<HundredYearPromo />
						</Spacer>
					</View>
				</VStack>
			</DomainsFullCart>
		</DomainSearch>
	);
};

export default DomainCartV2;
