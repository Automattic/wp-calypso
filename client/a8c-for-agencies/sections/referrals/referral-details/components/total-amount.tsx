import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ReferralPurchase } from '../../types';

type Props = {
	purchase: ReferralPurchase;
	isFetching: boolean;
	data?: APIProductFamilyProduct[];
};

const TotalAmount = ( { purchase, data, isFetching }: Props ) => {
	const product = data?.find( ( product ) => product.product_id === purchase.product_id );

	return isFetching ? <TextPlaceholder /> : `$${ product?.amount }`;
};

export default TotalAmount;
