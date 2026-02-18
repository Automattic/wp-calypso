import { isJetpackPlan, isJetpackProduct, isAkismetProduct } from '@automattic/calypso-products';
import { getCurrencyObject } from '@automattic/number-formatters';
import { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';

export type WpcomJetpackCartInfo = {
	akismetProducts: ResponseCartProduct[];
	jetpackProducts: ResponseCartProduct[];
	wpcomProducts: ResponseCartProduct[];
	containsAkismetProducts: boolean;
	containsJetpackProducts: boolean;
	containsWpcomProducts: boolean;
	akismetCost: number;
	jetpackCost: number;
	wpcomCost: number;
	akismetCostUSD: number;
	jetpackCostUSD: number;
	wpcomCostUSD: number;
	totalCostUSD: number;
};

export function splitCartProducts( cart: ResponseCart ): WpcomJetpackCartInfo {
	const akismetProducts = cart.products.filter( ( product ) => isAkismetProduct( product ) );
	const jetpackProducts = cart.products.filter(
		( product ) => isJetpackPlan( product ) || isJetpackProduct( product )
	);
	const wpcomProducts = cart.products.filter(
		( product ) =>
			! isJetpackPlan( product ) && ! isJetpackProduct( product ) && ! isAkismetProduct( product )
	);

	const akismetCost = akismetProducts
		.map( ( product ) => product.item_total_integer )
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );
	const jetpackCost = jetpackProducts
		.map( ( product ) => product.item_total_integer )
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );
	const wpcomCost = wpcomProducts
		.map( ( product ) => product.item_total_integer )
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );

	const akismetCostUSD = akismetProducts
		.map( ( product ) => product.item_total_usd_integer )
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );
	const jetpackCostUSD = jetpackProducts
		.map( ( product ) => product.item_total_usd_integer )
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );
	const wpcomCostUSD = wpcomProducts
		.map( ( product ) => product.item_total_usd_integer )
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );

	return {
		akismetProducts: akismetProducts,
		jetpackProducts: jetpackProducts,
		wpcomProducts: wpcomProducts,
		containsAkismetProducts: 0 !== akismetProducts.length,
		containsJetpackProducts: 0 !== jetpackProducts.length,
		containsWpcomProducts: 0 !== wpcomProducts.length,
		akismetCost: getCurrencyObject( akismetCost, cart.currency, { isSmallestUnit: true } )
			.floatValue,
		jetpackCost: getCurrencyObject( jetpackCost, cart.currency, { isSmallestUnit: true } )
			.floatValue,
		wpcomCost: getCurrencyObject( wpcomCost, cart.currency, { isSmallestUnit: true } ).floatValue,
		akismetCostUSD: getCurrencyObject( akismetCostUSD, 'USD', { isSmallestUnit: true } ).floatValue,
		jetpackCostUSD: getCurrencyObject( jetpackCostUSD, 'USD', { isSmallestUnit: true } ).floatValue,
		wpcomCostUSD: getCurrencyObject( wpcomCostUSD, 'USD', { isSmallestUnit: true } ).floatValue,
		totalCostUSD: getCurrencyObject( cart.total_cost_usd_integer, 'USD', { isSmallestUnit: true } )
			.floatValue,
	};
}
