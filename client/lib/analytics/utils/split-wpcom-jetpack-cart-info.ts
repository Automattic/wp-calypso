import { isJetpackPlan, isJetpackProduct } from '@automattic/calypso-products';
import { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import costToUSD from './cost-to-usd';

export type WpcomJetpackCartInfo = {
	wpcomProducts: ResponseCartProduct[];
	jetpackProducts: ResponseCartProduct[];
	containsWpcomProducts: boolean;
	containsJetpackProducts: boolean;
	jetpackCost: number;
	wpcomCost: number;
	jetpackCostUSD: number;
	wpcomCostUSD: number;
	totalCostUSD: number;
};

export function splitWpcomJetpackCartInfo( cart: ResponseCart ): WpcomJetpackCartInfo {
	const jetpackCost = cart.products
		.map( ( product ) =>
			isJetpackPlan( product ) || isJetpackProduct( product ) ? product.cost : 0
		)
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );
	const wpcomCost = cart.total_cost_integer / 100 - jetpackCost;
	const wpcomProducts = cart.products.filter(
		( product ) => ! isJetpackPlan( product ) && ! isJetpackProduct( product )
	);
	const jetpackProducts = cart.products.filter(
		( product ) => isJetpackPlan( product ) || isJetpackProduct( product )
	);

	return {
		wpcomProducts: wpcomProducts,
		jetpackProducts: jetpackProducts,
		containsWpcomProducts: 0 !== wpcomProducts.length,
		containsJetpackProducts: 0 !== jetpackProducts.length,
		jetpackCost: jetpackCost,
		wpcomCost: wpcomCost,
		jetpackCostUSD: costToUSD( jetpackCost, cart.currency ),
		wpcomCostUSD: costToUSD( wpcomCost, cart.currency ),
		totalCostUSD: costToUSD( cart.total_cost_integer / 100, cart.currency ),
	};
}
