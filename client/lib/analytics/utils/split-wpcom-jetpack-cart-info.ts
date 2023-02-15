import { isJetpackPlan, isJetpackProduct, isAkismetProduct } from '@automattic/calypso-products';
import { ResponseCart, ResponseCartProduct } from '@automattic/shopping-cart';
import costToUSD from './cost-to-usd';

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
	const jetpackCost = cart.products
		.map( ( product ) =>
			isJetpackPlan( product ) || isJetpackProduct( product ) ? product.cost : 0
		)
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );
	const akismetCost = cart.products
		.map( ( product ) => ( isAkismetProduct( product ) ? product.cost : 0 ) )
		.reduce( ( accumulator, cost ) => accumulator + cost, 0 );
	const wpcomCost = cart.total_cost_integer / 100 - jetpackCost;

	const wpcomProducts = cart.products.filter(
		( product ) =>
			! isJetpackPlan( product ) && ! isJetpackProduct( product ) && ! isAkismetProduct( product )
	);
	const jetpackProducts = cart.products.filter(
		( product ) => isJetpackPlan( product ) || isJetpackProduct( product )
	);
	const akismetProducts = cart.products.filter( ( product ) => isAkismetProduct( product ) );

	return {
		akismetProducts: akismetProducts,
		jetpackProducts: jetpackProducts,
		wpcomProducts: wpcomProducts,
		containsAkismetProducts: 0 !== akismetProducts.length,
		containsJetpackProducts: 0 !== jetpackProducts.length,
		containsWpcomProducts: 0 !== wpcomProducts.length,
		akismetCost: akismetCost,
		jetpackCost: jetpackCost,
		wpcomCost: wpcomCost,
		akismetCostUSD: costToUSD( akismetCost, cart.currency ) ?? 0,
		jetpackCostUSD: costToUSD( jetpackCost, cart.currency ) ?? 0,
		wpcomCostUSD: costToUSD( wpcomCost, cart.currency ) ?? 0,
		totalCostUSD: costToUSD( cart.total_cost_integer / 100, cart.currency ) ?? 0,
	};
}
