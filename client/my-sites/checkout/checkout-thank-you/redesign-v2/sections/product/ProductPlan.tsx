import { Button, Spinner } from '@automattic/components';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import { useSelector } from 'calypso/state';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import { ReceiptPurchase } from 'calypso/state/receipts/types';

export type ProductPlanProps = {
	siteSlug: string;
	primaryPurchase: ReceiptPurchase;
	siteID: number;
	currency?: string;
};
const ProductPlan = ( { siteSlug, primaryPurchase, siteID }: ProductPlanProps ) => {
	const isLoadingPurchases = useSelector(
		( state ) => isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state )
	);
	const [ expirationDate, setExpirationDate ] = useState( '' );

	const purchases = useSelector( ( state ) => getSitePurchases( state, siteID ) );
	const productPurchase = useMemo(
		() => getPurchaseByProductSlug( purchases, primaryPurchase.productSlug ),
		[ primaryPurchase.productSlug, purchases ]
	);

	useEffect( () => {
		if ( ! isLoadingPurchases && productPurchase ) {
			setExpirationDate(
				translate( 'Expires on %s', {
					args: moment( productPurchase.expiryDate ).format( 'LL' ),
				} ).toString()
			);
		}
	}, [ isLoadingPurchases, productPurchase ] );

	return (
		<div className="checkout-thank-you__header-details">
			<div className="checkout-thank-you__header-details-content">
				{ isLoadingPurchases ? (
					<Spinner />
				) : (
					<>
						<div className="checkout-thank-you__header-details-content-name">
							{ translate( '%(productName)s plan', {
								args: {
									productName: primaryPurchase.productName,
								},
							} ) }
						</div>
						<div className="checkout-thank-you__header-details-content-expiry">
							{ expirationDate }
						</div>
					</>
				) }
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
