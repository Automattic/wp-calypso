import { Dialog, Gridicon } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import CardHeading from 'calypso/components/card-heading';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getPaymentMethodImageURL, isCreditCard } from 'calypso/lib/checkout/payment-methods';
import type { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import type { Purchase } from 'calypso/lib/purchases/types';

import 'calypso/me/purchases/payment-methods/style.scss';

interface Props {
	card: StoredPaymentMethod;
	paymentMethodSummary: TranslateResult;
	purchases: Purchase[];
	isVisible: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const PaymentMethodDeleteDialog: FunctionComponent< Props > = ( {
	card,
	paymentMethodSummary,
	purchases,
	isVisible,
	onClose,
	onConfirm,
} ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const associatedSubscriptions = purchases?.filter(
		( purchase: Purchase ) =>
			purchase.payment?.storedDetailsId === card.stored_details_id && purchase.isAutoRenewEnabled
	);

	return (
		<Dialog
			isVisible={ isVisible }
			additionalClassNames="payment-method-delete-dialog"
			onClose={ onClose }
			buttons={ [
				{ action: 'cancel', label: translate( 'Cancel' ), onClick: onClose },
				{
					action: 'confirm',
					label: translate( 'Delete' ),
					isPrimary: true,
					additionalClassNames: 'is-scary',
					onClick: onConfirm,
				},
			] }
		>
			<CardHeading tagName="h2" size={ 24 }>
				{ translate( 'Remove payment method' ) }
			</CardHeading>
			<p>
				{ translate(
					'The payment method {{paymentMethodSummary/}} will be removed from your account and from all the associated subscriptions.',
					{
						components: {
							paymentMethodSummary: <strong>{ paymentMethodSummary }</strong>,
						},
					}
				) }
			</p>
			{ associatedSubscriptions.length > 0 && (
				<div className="payment-method-delete-dialog__affected-subscriptions-wrapper">
					<div className="payment-method-delete-dialog__affected-subscriptions-title-wrapper">
						<CardHeading tagName="h2" size={ 20 }>
							{ translate( 'Associated subscriptions' ) }
						</CardHeading>
						{ isCreditCard( card ) && (
							<img src={ getPaymentMethodImageURL( card?.card_type ) } alt="" />
						) }
					</div>
					{ associatedSubscriptions.map( ( subscription: Purchase ) => (
						<div
							className="payment-method-delete-dialog__affected-subscription"
							key={ subscription.id }
						>
							<div>
								<span>{ subscription.productName }</span>
								<span className="payment-method-delete-dialog__affected-subscription-domain">
									{ subscription.meta || subscription.domain }
								</span>
							</div>
							<div>
								<span className="payment-method-delete-dialog__affected-subscription-date">
									<span>
										{ translate( 'Auto-renews', {
											comment: 'followed by a date - eg. "Auto-renews 21 Apr 2025"',
										} ) }
									</span>
									<span>{ moment( subscription.renewDate ).format( 'll' ) }</span>
								</span>
							</div>
						</div>
					) ) }
					<div className="payment-method-delete-dialog__warning">
						<Gridicon icon="notice-outline" size={ 24 } />
						<p>
							{ translate(
								'This subscription will no longer auto-renew until an alternative payment method is added.',
								'These subscriptions will no longer auto-renew until an alternative payment method is added.',
								{
									count: associatedSubscriptions.length,
								}
							) }
						</p>
					</div>
				</div>
			) }
		</Dialog>
	);
};

export default PaymentMethodDeleteDialog;
