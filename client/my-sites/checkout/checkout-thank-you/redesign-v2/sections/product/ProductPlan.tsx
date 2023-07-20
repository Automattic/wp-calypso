import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { ReceiptPurchase } from 'calypso/state/receipts/types';

type ProductPlanProps = {
	siteSlug: string;
	primaryPurchase: ReceiptPurchase;
	purchases: ReceiptPurchase[];
};
const ProductPlan = ( { siteSlug, primaryPurchase, purchases }: ProductPlanProps ) => {
	const [ expirationDate, setExpirationDate ] = useState( '' );

	const productPurchase = useMemo(
		() => purchases.find( ( purchase ) => purchase.productSlug === primaryPurchase.productSlug ),
		[ primaryPurchase.productSlug, purchases ]
	);

	useEffect( () => {
		if ( productPurchase?.expiryDate ) {
			setExpirationDate(
				translate( 'Expires on %s', {
					args: moment( productPurchase.expiryDate ).format( 'LL' ),
				} ).toString()
			);
		}
	}, [ productPurchase ] );

	return (
		<div className="checkout-thank-you__header-details">
			<div className="checkout-thank-you__header-details-content">
				<div className="checkout-thank-you__header-details-content-name">
					{ translate( '%(productName)s plan', {
						args: {
							productName: primaryPurchase.productName,
						},
					} ) }
				</div>
				<div className="checkout-thank-you__header-details-content-expiry">{ expirationDate }</div>
			</div>
			<div className="checkout-thank-you__header-details-buttons">
				<Button primary href={ `/home/${ siteSlug }` }>
					{ translate( 'Let’s work on the site' ) }
				</Button>
				<Button href={ `/plans/my-plan/${ siteSlug }` }>{ translate( 'Manage plan' ) }</Button>
			</div>
		</div>
	);
};
export default ProductPlan;
