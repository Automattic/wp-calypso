import { isAkismetFreeProduct, isDomainTransfer } from '@automattic/calypso-products';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isOneTimePurchase, isPaidWithCreditCard, isPartnerPurchase } from 'calypso/lib/purchases';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import {
	canEditPaymentDetails,
	isAkismetHoldingSitePurchase,
	isMarketplaceHoldingSitePurchase,
} from '../utils';
import PaymentInfoBlock from './payment-info-block';
import type { SiteDetails } from '@automattic/data-stores';
import type { Purchase, GetChangePaymentMethodUrlFor } from 'calypso/lib/purchases/types';

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
			product_slug: purchase.productSlug,
		} );
	};

	if (
		isOneTimePurchase( purchase ) ||
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
