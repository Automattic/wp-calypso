import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import type { ReferralPurchase } from '../../types';
const getProductName = ( productId: number, data: APIProductFamilyProduct[] ) => {
	const product = data.find( ( product ) => product.product_id === productId );
	return product?.name;
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
			{ products
				.map( ( product ) => getProductName( product.product_id, productsData ) )
				.join( ', ' ) }
		</div>
	);
}
