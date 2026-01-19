import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import type { ReferralPurchase } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

const getProductName = ( purchase: ReferralPurchase, data: APIProductFamilyProduct[] ) => {
	const product = data?.find( ( product ) =>
		[ product.monthly_product_id, product.yearly_product_id, product.product_id ].includes(
			purchase.product_id
		)
	);
	// Use product_name from subscription if available, otherwise fall back to product name from data
	return purchase.subscription?.product_name || product?.name;
};

export default function ReferralProducts( {
	products,
	isFetchingProducts,
	productsData,
}: {
	products: ReferralPurchase[];
	isFetchingProducts: boolean;
	productsData: APIProductFamilyProduct[] | undefined;
} ) {
	if ( isFetchingProducts || ! productsData ) {
		return <TextPlaceholder />;
	}
	return (
		<div>
			{ products.map( ( product ) => getProductName( product, productsData ) ).join( ', ' ) }
		</div>
	);
}
