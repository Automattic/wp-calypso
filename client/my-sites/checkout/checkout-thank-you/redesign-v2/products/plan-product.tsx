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

export type ThankYouPlanProductProps = {
	purchase: ReceiptPurchase;
	siteSlug: string | null;
	siteId: number | null;
};

export default function ThankYouPlanProduct( {
	purchase,
	siteSlug,
	siteId,
}: ThankYouPlanProductProps ) {
	const isLoadingPurchases = useSelector(
		( state ) => isFetchingSitePurchases( state ) || ! hasLoadedSitePurchasesFromServer( state )
	);

	const purchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );

	const productPurchase = useMemo(
		() => getPurchaseByProductSlug( purchases, purchase.productSlug ),
		[ purchase.productSlug, purchases ]
	);

	const [ expirationDate, setExpirationDate ] = useState( '' );

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
					<Button variant="primary" href={ `/home/${ siteSlug }` }>
						{ translate( 'Let’s work on the site' ) }
					</Button>
					<Button variant="secondary" href={ `/plans/my-plan/${ siteSlug }` }>
						{ translate( 'Manage plan' ) }
					</Button>
				</>
			}
			isLoading={ isLoadingPurchases }
		/>
	);
}
