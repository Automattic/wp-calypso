import { useTranslate } from 'i18n-calypso';
import './style.scss';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';
import useProductsQuery from 'calypso/a8c-for-agencies/data/marketplace/use-products-query';
import { APIProductFamilyProduct } from 'calypso/state/partner-portal/types';
import { ReferralPurchase } from '../../types';

type PurchaseItemProps = {
	purchase: ReferralPurchase;
	data?: APIProductFamilyProduct[];
	isFetching: boolean;
};

const PurchaseItem = ( { purchase, data, isFetching }: PurchaseItemProps ) => {
	const translate = useTranslate();
	const product = data?.find( ( product ) => product.product_id === purchase.product_id );

	return (
		<div className="referral-purchases-mobile">
			<div className="referral-purchases-mobile__header">
				<h3>{ translate( 'Product Details' ).toUpperCase() }</h3>
			</div>

			<h2>Woo</h2>
			<div className="referral-purchases-mobile__content">
				<h3>{ translate( 'Date' ).toUpperCase() }</h3>
				<p>May 14, 2023</p>
			</div>
			<div className="referral-purchases-mobile__content">
				<h3>{ translate( 'Assigned to' ).toUpperCase() }</h3>
				<p>2</p>
			</div>
			<div className="referral-purchases-mobile__content">
				<h3>{ translate( 'Total' ).toUpperCase() }</h3>
				<p>{ isFetching ? <TextPlaceholder /> : `$${ product?.amount }` }</p>
			</div>
		</div>
	);
};

const ReferralPurchasesMobile = ( { purchases }: { purchases: ReferralPurchase[] } ) => {
	const { data, isFetching } = useProductsQuery();

	return (
		<div className="referral-purchases-mobile__wrapper">
			{ purchases.map( ( purchase ) => (
				<PurchaseItem purchase={ purchase } data={ data } isFetching={ isFetching } />
			) ) }
		</div>
	);
};

export default ReferralPurchasesMobile;
