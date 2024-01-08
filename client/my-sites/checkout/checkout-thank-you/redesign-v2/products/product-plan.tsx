import { Button } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';
import ThankYouProduct from 'calypso/components/thank-you-v2/product';
import { getPurchaseByProductSlug } from 'calypso/lib/purchases/utils';
import { useSelector } from 'calypso/state';
import {
	getSitePurchases,
	hasLoadedSitePurchasesFromServer,
	isFetchingSitePurchases,
} from 'calypso/state/purchases/selectors';
import { ReceiptPurchase } from 'calypso/state/receipts/types';

export type ProductPlanProps = {
	purchase: ReceiptPurchase;
	siteSlug: string;
	siteId: number;
};

const ProductPlan = ( { purchase, siteSlug, siteId }: ProductPlanProps ) => {
	const isLoadingPurchases = useSelector(
		( state ) => isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state )
	);
	const [ expirationDate, setExpirationDate ] = useState( '' );

	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	const productPurchase = useMemo(
		() => getPurchaseByProductSlug( purchases, purchase.productSlug ),
		[ purchase.productSlug, purchases ]
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
		<ThankYouProduct
			name={ translate( '%(productName)s plan', {
				args: {
					productName: purchase.productName,
				},
			} ) }
			key={ 'plan-' + purchase.productSlug }
			details={ expirationDate }
			actions={
				<>
					<Button primary href={ `/home/${ siteSlug }` }>
						{ translate( 'Let’s work on the site' ) }
					</Button>
					<Button href={ `/plans/my-plan/${ siteSlug }` }>{ translate( 'Manage plan' ) }</Button>
				</>
			}
			isLoading={ expirationDate === '' }
		/>
	);
};

export default ProductPlan;
