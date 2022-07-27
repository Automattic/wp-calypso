import type { ResponseCartProduct, ProductCostOverride } from '@automattic/shopping-cart';

export function PriceOverrideList( { product }: { product: ResponseCartProduct } ) {
	if ( ! product.cost_overrides || product.cost_overrides.length < 1 ) {
		return null;
	}
	return (
		<div>
			{ product.cost_overrides.map( ( override ) => (
				<PriceOverride override={ override } />
			) ) }
		</div>
	);
}

function PriceOverride( { override }: { override: ProductCostOverride } ) {
	return <div>{ override.user_facing_reason }</div>;
}
