import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { ReferralPurchase } from '../../types';
import type { APIProductFamilyProduct } from 'calypso/a8c-for-agencies/types/products';

type Props = {
	purchase: ReferralPurchase;
	isFetching: boolean;
	data?: APIProductFamilyProduct[];
};

const ProductDetails = ( { purchase, data, isFetching }: Props ) => {
	const product = data?.find( ( product ) =>
		[ product.monthly_product_id, product.yearly_product_id, product.product_id ].includes(
			purchase.product_id
		)
	);

	if ( isFetching ) {
		return <TextPlaceholder />;
	}

	// Use product_name from subscription if available, otherwise fall back to product name from data
	const productName = purchase.subscription?.product_name || product?.name;

	return productName;
};

export default ProductDetails;
