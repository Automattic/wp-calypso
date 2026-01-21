import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { ReferralPurchase } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

type Props = {
	purchase: ReferralPurchase;
	isFetching: boolean;
	data?: APIProductFamilyProduct[];
};

const ProductDetails = ( { purchase, data, isFetching }: Props ) => {
	if ( isFetching ) {
		return <TextPlaceholder />;
	}

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

export default ProductDetails;
