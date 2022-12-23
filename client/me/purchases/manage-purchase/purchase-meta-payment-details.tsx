import { isDomainTransfer } from '@automattic/calypso-products';
import { useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { isOneTimePurchase, isPaidWithCreditCard } from 'calypso/lib/purchases';
import { getAllStoredCards } from 'calypso/state/stored-cards/selectors';
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
	const cards = useSelector( getAllStoredCards );
	const handleEditPaymentMethodClick = () => {
		recordTracksEvent( 'calypso_purchases_edit_payment_method' );
	};

	if ( isOneTimePurchase( purchase ) || isDomainTransfer( purchase ) ) {
		return null;
	}

	const paymentDetails = <PaymentInfoBlock purchase={ purchase } cards={ cards } />;

	if ( ! canEditPaymentDetails( purchase ) || ! isPaidWithCreditCard( purchase ) || ! site ) {
		return <li>{ paymentDetails }</li>;
	}

	return (
		<li>
			{ siteSlug && (
				<a
					href={ getChangePaymentMethodUrlFor( siteSlug, purchase ) }
					onClick={ handleEditPaymentMethodClick }
				>
					{ paymentDetails }
				</a>
			) }
			{ ! siteSlug && paymentDetails }
		</li>
	);
}

export default PurchaseMetaPaymentDetails;
