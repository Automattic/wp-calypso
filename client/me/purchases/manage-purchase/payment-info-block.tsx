import { Icon, warning } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import PaymentLogo from 'calypso/components/payment-logo';
import {
	isExpiring,
	isRechargeable,
	isIncludedWithPlan,
	isPaidWithCreditCard,
	isPaidWithCredits,
	isPaidWithPayPalDirect,
	paymentLogoType,
	hasPaymentMethod,
} from 'calypso/lib/purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { StoredCard } from 'calypso/my-sites/checkout/composite-checkout/types/stored-cards';
import type { ReactNode } from 'react';

export default function PaymentInfoBlock( {
	purchase,
	cards,
}: {
	purchase: Purchase;
	cards: StoredCard[];
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const isBackupMethodAvailable = cards.some(
		( card ) =>
			card.stored_details_id !== purchase.payment.storedDetailsId &&
			card.meta?.find( ( meta ) => meta.meta_key === 'is_backup' )?.meta_value
	);

	if ( isIncludedWithPlan( purchase ) ) {
		return <PaymentInfoBlockWrapper>{ translate( 'Included with plan' ) }</PaymentInfoBlockWrapper>;
	}

	if ( hasPaymentMethod( purchase ) && isPaidWithCredits( purchase ) ) {
		return <PaymentInfoBlockWrapper>{ translate( 'Credits' ) }</PaymentInfoBlockWrapper>;
	}

	if (
		hasPaymentMethod( purchase ) &&
		isPaidWithCreditCard( purchase ) &&
		isRechargeable( purchase )
	) {
		const logoType = paymentLogoType( purchase );
		const willNotBeBilled = !! ( isExpiring( purchase ) && purchase.payment.creditCard );
		return (
			<PaymentInfoBlockWrapper>
				<span className="manage-purchase__payment-method">
					<PaymentLogo type={ logoType } disabled={ isExpiring( purchase ) } />
					{ purchase.payment.creditCard?.number ?? '' }
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
		const willNotBeBilled = isExpiring( purchase );
		return (
			<PaymentInfoBlockWrapper>
				<span className="manage-purchase__payment-method">
					<PaymentLogo type={ logoType } disabled={ willNotBeBilled } />
				</span>
				{ translate( 'expiring %(cardExpiry)s', {
					args: {
						cardExpiry: moment( purchase.payment.expiryDate, 'MM/YY' ).format( 'MMMM YYYY' ),
					},
				} ) }
				{ willNotBeBilled && <WillNotBeBilledNotice /> }
				{ isBackupMethodAvailable && ! willNotBeBilled && <BackupPaymentMethodNotice /> }
			</PaymentInfoBlockWrapper>
		);
	}

	if ( hasPaymentMethod( purchase ) && isRechargeable( purchase ) ) {
		const logoType = paymentLogoType( purchase );
		const willNotBeBilled = isExpiring( purchase );
		return (
			<PaymentInfoBlockWrapper>
				<PaymentLogo type={ logoType } disabled={ willNotBeBilled } />
				{ willNotBeBilled && <WillNotBeBilledNotice /> }
				{ isBackupMethodAvailable && ! willNotBeBilled && <BackupPaymentMethodNotice /> }
			</PaymentInfoBlockWrapper>
		);
	}

	if ( purchase.isInAppPurchase ) {
		return <PaymentInfoBlockWrapper>{ translate( 'In-App Purchase' ) }</PaymentInfoBlockWrapper>;
	}

	if ( purchase.isAutoRenewEnabled && ! hasPaymentMethod( purchase ) ) {
		return (
			<PaymentInfoBlockWrapper>
				<div className={ 'manage-purchase__no-payment-method' }>
					<Icon icon={ warning } />
					{ translate( 'No payment method' ) }
				</div>
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
