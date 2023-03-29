import { isDomainTransfer } from '@automattic/calypso-products';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isOneTimePurchase, isPaidWithCreditCard } from 'calypso/lib/purchases';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/composite-checkout/hooks/use-stored-payment-methods';
import { canEditPaymentDetails } from '../utils';
import PaymentInfoBlock from './payment-info-block';
import type { Purchase, GetChangePaymentMethodUrlFor } from 'calypso/lib/purchases/types';

interface PaymentProps {
	purchase: Purchase;
	getChangePaymentMethodUrlFor: GetChangePaymentMethodUrlFor;
	siteSlug?: string;
	site?: string;
}

function PurchaseMetaPaymentDetails( {
	purchase,
	getChangePaymentMethodUrlFor,
	siteSlug,
	site,
}: PaymentProps ) {
	const { paymentMethods: cards } = useStoredPaymentMethods( { type: 'card' } );
	const handleEditPaymentMethodClick = () => {
		recordTracksEvent( 'calypso_purchases_edit_payment_method' );
	};

	if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
		return null;
	}

	const paymentDetails = <PaymentInfoBlock purchase={ purchase } cards={ cards } />;

	if (
		! canEditPaymentDetails( purchase ) ||
		! isPaidWithCreditCard( purchase ) ||
		! site ||
		! siteSlug
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
