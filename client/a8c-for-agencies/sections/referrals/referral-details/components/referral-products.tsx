import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import ReferralTitanDetails from './referral-titan-details';
import type { ReferralPurchase } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

const getProductName = ( purchase: ReferralPurchase, data: APIProductFamilyProduct[] ) => {
	let productName = purchase.subscription?.product_name;

	if ( ! productName ) {
		const product = data?.find( ( product ) =>
			[ product.monthly_product_id, product.yearly_product_id, product.product_id ].includes(
				purchase.product_id
			)
		);
		productName = product?.name;
	}

	return productName;
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
		<div className="referral-products">
			{ products.map( ( product, index ) => (
				<div key={ index } className="referral-products__product">
					<div className="referral-products__name">{ getProductName( product, productsData ) }</div>
					<ReferralTitanDetails product={ product } productsData={ productsData } />
				</div>
			) ) }
		</div>
	);
}
