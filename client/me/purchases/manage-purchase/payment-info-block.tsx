import { getPurchasePayment } from '@automattic/api-core';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import PaymentLogo from 'calypso/components/payment-logo';
import {
	isRechargeable,
	isIncludedWithPlan,
	isPaidWithCreditCard,
	isPaidWithCredits,
	isPaidWithPayPalDirect,
	paymentLogoType,
	hasPaymentMethod,
} from '../lib/raw-purchase-helpers';
import type { Purchase } from '@automattic/api-core';
import type { StoredPaymentMethod } from '@automattic/wpcom-checkout';
import type { ReactNode } from 'react';

export default function PaymentInfoBlock( {
	purchase,
	cards,
	addPaymentMethodUrl,
	onAddPaymentMethodClick,
}: {
	purchase: Purchase;
	cards: StoredPaymentMethod[];
	addPaymentMethodUrl?: string;
	onAddPaymentMethodClick?: () => void;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const payment = getPurchasePayment( purchase );
	const isBackupMethodAvailable = cards.some(
		( card ) => card.stored_details_id !== payment.storedDetailsId && card.is_backup
	);

	if ( isIncludedWithPlan( purchase ) ) {
		return <PaymentInfoBlockWrapper>{ translate( 'Included with plan' ) }</PaymentInfoBlockWrapper>;
	}

	if ( ! purchase.is_auto_renew_enabled && isPaidWithCredits( purchase ) ) {
		return <PaymentInfoBlockWrapper>{ translate( 'None' ) }</PaymentInfoBlockWrapper>;
	}

	if ( hasPaymentMethod( purchase ) && isPaidWithCredits( purchase ) ) {
		return (
			<PaymentInfoBlockWrapper>
				<NoPaymentMethodWarning
					addPaymentMethodUrl={ addPaymentMethodUrl }
					onAddPaymentMethodClick={ onAddPaymentMethodClick }
				/>
			</PaymentInfoBlockWrapper>
		);
	}

	const willNotBeBilled = ! purchase.might_still_auto_renew;

	if (
		hasPaymentMethod( purchase ) &&
		isPaidWithCreditCard( purchase ) &&
		isRechargeable( purchase )
	) {
		const logoType = paymentLogoType( purchase );
		return (
			<PaymentInfoBlockWrapper>
				<span className="manage-purchase__payment-method">
					<PaymentLogo type={ logoType } disabled={ willNotBeBilled } />
					{ payment.creditCard?.number ?? '' }
				</span>
				{ willNotBeBilled && <WillNotBeBilledNotice /> }
				{ isBackupMethodAvailable && ! willNotBeBilled && <BackupPaymentMethodNotice /> }
			</PaymentInfoBlockWrapper>
		);
	}

	if (
		hasPaymentMethod( purchase ) &&
		isPaidWithPayPalDirect( purchase ) &&
		isRechargeable( purchase )
	) {
		const logoType = paymentLogoType( purchase );
		return (
			<PaymentInfoBlockWrapper>
				<span className="manage-purchase__payment-method">
					<PaymentLogo type={ logoType } disabled={ willNotBeBilled } />
				</span>
				{ translate( 'expiring %(cardExpiry)s', {
					args: {
						cardExpiry: moment( payment.expiryDate, 'MM/YY' ).format( 'MMMM YYYY' ),
					},
				} ) }
				{ willNotBeBilled && <WillNotBeBilledNotice /> }
				{ isBackupMethodAvailable && ! willNotBeBilled && <BackupPaymentMethodNotice /> }
			</PaymentInfoBlockWrapper>
		);
	}

	if ( hasPaymentMethod( purchase ) && isRechargeable( purchase ) ) {
		const logoType = paymentLogoType( purchase );
		return (
			<PaymentInfoBlockWrapper>
				<PaymentLogo type={ logoType } disabled={ willNotBeBilled } />
				{ willNotBeBilled && <WillNotBeBilledNotice /> }
				{ isBackupMethodAvailable && ! willNotBeBilled && <BackupPaymentMethodNotice /> }
			</PaymentInfoBlockWrapper>
		);
	}

	if ( purchase.is_iap_purchase ) {
		return <PaymentInfoBlockWrapper>{ translate( 'In-App Purchase' ) }</PaymentInfoBlockWrapper>;
	}

	if ( purchase.is_auto_renew_enabled && ! hasPaymentMethod( purchase ) ) {
		return (
			<PaymentInfoBlockWrapper>
				<NoPaymentMethodWarning
					addPaymentMethodUrl={ addPaymentMethodUrl }
					onAddPaymentMethodClick={ onAddPaymentMethodClick }
				/>
			</PaymentInfoBlockWrapper>
		);
	}

	if (
		! isRechargeable( purchase ) &&
		hasPaymentMethod( purchase ) &&
		purchase.is_auto_renew_enabled
	) {
		return (
			<PaymentInfoBlockWrapper>
				<NoPaymentMethodWarning
					addPaymentMethodUrl={ addPaymentMethodUrl }
					onAddPaymentMethodClick={ onAddPaymentMethodClick }
				/>
			</PaymentInfoBlockWrapper>
		);
	}
	return <PaymentInfoBlockWrapper>{ translate( 'None' ) }</PaymentInfoBlockWrapper>;
}

function PaymentInfoBlockWrapper( { children }: { children: ReactNode } ) {
	const translate = useTranslate();
	return (
		<aside aria-label={ String( translate( 'Payment method' ) ) }>
			<em className="manage-purchase__detail-label">{ translate( 'Payment method' ) }</em>
			<span className="manage-purchase__detail">{ children }</span>
		</aside>
	);
}

function NoPaymentMethodWarning( {
	addPaymentMethodUrl,
	onAddPaymentMethodClick,
}: {
	addPaymentMethodUrl?: string;
	onAddPaymentMethodClick?: () => void;
} ) {
	const translate = useTranslate();
	return (
		<div className="manage-purchase__no-payment-method">
			{ translate( 'You don’t have a payment method to renew this subscription' ) }
			{ addPaymentMethodUrl && (
				<Button
					className="manage-purchase__add-payment-method-link"
					variant="link"
					href={ addPaymentMethodUrl }
					onClick={ onAddPaymentMethodClick }
				>
					{ translate( 'Add payment method' ) }
				</Button>
			) }
		</div>
	);
}

function WillNotBeBilledNotice() {
	const translate = useTranslate();
	return (
		<div className="manage-purchase__detail-label-subtitle">
			{ translate( '(this will not be billed)' ) }
		</div>
	);
}

function BackupPaymentMethodNotice() {
	const translate = useTranslate();
	const noticeText = translate(
		'If the renewal fails, a {{link}}backup payment method{{/link}} may be used.',
		{
			components: {
				link: <a href="/me/purchases/payment-methods" />,
			},
		}
	);
	return <div className="manage-purchase__backup-payment-method-notice">{ noticeText }</div>;
}
