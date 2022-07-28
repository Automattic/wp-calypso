import { useTranslate } from 'i18n-calypso';
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
	const translate = useTranslate();
	const percentage = 100 - ( override.new_price / override.old_price ) * 100;
	switch ( override.reason ) {
		case 'upsell_bundle_apply_discount':
			return (
				<div>{ translate( 'Prorated discount %(percentage)d%%', { args: { percentage } } ) }</div>
			);
		case 'domain volume discount':
			return (
				<div>
					{ translate( 'Multiple domain discount %(percentage)d%%', { args: { percentage } } ) }
				</div>
			);
		case 'apply_sale_coupon':
			return <div>{ translate( 'Discount %(percentage)d%%', { args: { percentage } } ) }</div>;
		case 'bundled domain credit':
			return <div>{ translate( 'Bundled domain' ) }</div>;
	}
	return null;
}
