import { Gridicon } from '@automattic/components';
import { Button } from '@wordpress/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { ConfirmDialog, DialogContent, DialogFooter } from 'calypso/components/confirm-dialog';
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

const PaymentMethodDeleteDialog = ( {
	card,
	paymentMethodSummary,
	purchases,
	onClose,
	isVisible,
	onConfirm,
}: Props ) => {
	const moment = useLocalizedMoment();
	const translate = useTranslate();
	const associatedSubscriptions = purchases?.filter(
		( purchase: Purchase ) =>
			purchase.payment?.storedDetailsId === card.stored_details_id && purchase.isAutoRenewEnabled
	);

	const handleClose = () => {
		onClose();
	};

	if ( ! isVisible ) {
		return null;
	}

	return (
		<ConfirmDialog
			onRequestClose={ handleClose }
			className="payment-method-delete-dialog"
			title={ translate( 'Remove payment method' ) }
		>
			<DialogContent className="payment-method-delete-dialog__content">
				<div className="payment-method-delete-dialog__explanation">
					{ isCreditCard( card ) && (
						<img src={ getPaymentMethodImageURL( card?.card_type ) } alt="" />
					) }
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
				</div>

				{ associatedSubscriptions.length > 0 && (
					<div className="payment-method-delete-dialog__affected-subscriptions-wrapper">
						<table className="payment-method-delete-dialog__affected-subscriptions-table">
							<thead>
								<tr>
									<th>{ translate( 'Subscription' ) }</th>
									<th>{ translate( 'Renew date' ) }</th>
								</tr>
							</thead>
							<tbody>
								{ associatedSubscriptions.map( ( purchase: Purchase ) => (
									<tr key={ purchase.id }>
										<td className="payment-method-delete-dialog__affected-subscription-details-product">
											<strong>{ purchase.productName }</strong>
											<span className="payment-method-delete-dialog__affected-subscription-domain">
												{ purchase.meta || purchase.domain }
											</span>
										</td>
										<td className="payment-method-delete-dialog__affected-subscription-details-renew-date fixed">
											{ moment( purchase.renewDate ).format( 'll' ) }
										</td>
									</tr>
								) ) }
							</tbody>
						</table>
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
			</DialogContent>
			<DialogFooter>
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>
				<Button variant="primary" isDestructive onClick={ onConfirm }>
					{ translate( 'Remove' ) }
				</Button>
			</DialogFooter>
		</ConfirmDialog>
	);
};

export default PaymentMethodDeleteDialog;
