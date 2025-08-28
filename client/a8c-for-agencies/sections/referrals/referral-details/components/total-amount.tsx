import { Gridicon } from '@automattic/components';
import { formatCurrency } from '@automattic/number-formatters';
import { useTranslate } from 'i18n-calypso';
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

	// Use purchase_price from subscription if available, otherwise fall back to product amount
	let amount = Number( product?.amount );
	let currency = 'USD';
	let interval = 'month';

	if ( purchase.subscription?.purchase_price ) {
		amount = purchase.subscription.purchase_price;
		currency = purchase.subscription.purchase_currency;
		interval = purchase.subscription.billing_interval_unit;
	}

	if ( ! amount ) {
		return <Gridicon icon="minus" />;
	}

	const formatted = formatCurrency( amount, currency );

	return interval === 'year'
		? /* translators: %(total)s is the price of the subscription per year */
		  translate( '%(total)s/yr', {
				args: { total: formatted },
		  } )
		: /* translators: %(total)s is the price of the subscription per month */
		  translate( '%(total)s/mo', {
				args: { total: formatted },
		  } );
};

export default TotalAmount;
