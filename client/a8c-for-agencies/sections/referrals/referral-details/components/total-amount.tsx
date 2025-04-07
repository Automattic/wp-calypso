import { Gridicon } from '@automattic/components';
import { useTranslate, formatCurrency } from 'i18n-calypso';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ReferralPurchase } from '../../types';

type Props = {
	purchase: ReferralPurchase;
	isFetching: boolean;
	data?: APIProductFamilyProduct[];
};

const TotalAmount = ( { purchase, data, isFetching }: Props ) => {
	const translate = useTranslate();

	const product = data?.find( ( product ) => product.product_id === purchase.product_id );

	if ( isFetching ) {
		return <TextPlaceholder />;
	}

	return product?.amount ? (
		translate( '%(total)s/mo', {
			args: { total: formatCurrency( Number( product.amount ?? 0 ), product.currency ?? 'USD' ) },
		} )
	) : (
		<Gridicon icon="minus" />
	);
};

export default TotalAmount;
