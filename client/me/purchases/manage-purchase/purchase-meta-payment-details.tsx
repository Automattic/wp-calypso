import { isPurchaseOneTimePurchase, type Purchase } from '@automattic/api-core';
import { isAkismetFreeProduct, isDomainTransfer } from '@automattic/calypso-products';
import {
	isAkismetHoldingSitePurchase,
	isMarketplaceHoldingSitePurchase,
} from 'calypso/dashboard/utils/purchase';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import {
	canEditPaymentDetails,
	isPaidWithCreditCard,
	isPartnerPurchase,
} from '../lib/raw-purchase-helpers';
import PaymentInfoBlock from './payment-info-block';
import type { GetChangePaymentMethodUrlFor } from '../lib/types';
import type { SiteDetails } from '@automattic/data-stores';

interface PaymentProps {
	purchase: Purchase;
	getChangePaymentMethodUrlFor: GetChangePaymentMethodUrlFor;
	siteSlug?: string;
	site?: SiteDetails;
	isAkismetPurchase: boolean;
	isA4ABillingDragonPurchase?: boolean;
}

function PurchaseMetaPaymentDetails( {
	purchase,
	getChangePaymentMethodUrlFor,
	siteSlug,
	site,
	isAkismetPurchase,
	isA4ABillingDragonPurchase,
}: PaymentProps ) {
	const { paymentMethods: cards } = useStoredPaymentMethods( { type: 'card' } );
	const handleEditPaymentMethodClick = () => {
		recordTracksEvent( 'calypso_purchases_edit_payment_method' );
	};

	const isHoldingSitePurchase =
		isAkismetHoldingSitePurchase( purchase ) || isMarketplaceHoldingSitePurchase( purchase );

	const canAddPaymentMethod =
		canEditPaymentDetails( purchase ) &&
		! isPaidWithCreditCard( purchase ) &&
		!! siteSlug &&
		! ( isPartnerPurchase( purchase ) && ! isA4ABillingDragonPurchase ) &&
		( !! site || isAkismetPurchase || !! isA4ABillingDragonPurchase || isHoldingSitePurchase );

	const addPaymentMethodUrl =
		canAddPaymentMethod && siteSlug
			? getChangePaymentMethodUrlFor( siteSlug, purchase )
			: undefined;

	const handleAddPaymentMethodClick = () => {
		recordTracksEvent( 'calypso_purchases_add_payment_method_from_warning', {
			product_slug: purchase.product_slug,
		} );
	};

	if (
		isPurchaseOneTimePurchase( purchase ) ||
		isDomainTransfer( purchase ) ||
		isAkismetFreeProduct( purchase )
	) {
		return null;
	}

	const paymentDetails = (
		<PaymentInfoBlock
			purchase={ purchase }
			cards={ cards }
			addPaymentMethodUrl={ addPaymentMethodUrl }
			onAddPaymentMethodClick={ handleAddPaymentMethodClick }
		/>
	);

	if (
		! canEditPaymentDetails( purchase ) ||
		! isPaidWithCreditCard( purchase ) ||
		! siteSlug ||
		( ! site && ! isAkismetPurchase && ! isA4ABillingDragonPurchase )
	) {
		return <li>{ paymentDetails }</li>;
	}

	return (
		<li>
			<a
				href={ getChangePaymentMethodUrlFor( siteSlug, purchase ) }
				onClick={ handleEditPaymentMethodClick }
			>
				{ paymentDetails }
			</a>
		</li>
	);
}

export default PurchaseMetaPaymentDetails;
