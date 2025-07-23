import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import type { ReferralPurchase } from '../../types';

const getProductName = ( purchase: ReferralPurchase, data: APIProductFamilyProduct[] ) => {
	const product = data.find( ( product ) => product.product_id === purchase.product_id );

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
