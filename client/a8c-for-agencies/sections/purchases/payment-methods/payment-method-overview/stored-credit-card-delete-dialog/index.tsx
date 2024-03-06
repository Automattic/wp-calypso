import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { useRecentPaymentMethodsQuery } from 'calypso/jetpack-cloud/sections/partner-portal/hooks';
import { PaymentMethodSummary } from 'calypso/lib/checkout/payment-methods';
import DeletePrimaryCardConfirmation from './delete-primary-confirmation';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	paymentMethod: PaymentMethod;
	isVisible: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const StoredCreditCardDeleteDialog: FunctionComponent< Props > = ( {
	paymentMethod,
	isVisible,
	onClose,
	onConfirm,
} ) => {
	const translate = useTranslate();

	const { data: recentCards, isFetching: isFetchingRecentPaymentMethods } =
		useRecentPaymentMethodsQuery( {
			enabled: paymentMethod.is_default,
		} );

	return (
		<Dialog
			isVisible={ isVisible }
			additionalClassNames="stored-credit-card-delete-dialog"
			onClose={ onClose }
			buttons={ [
				<Button disabled={ false } onClick={ onClose }>
					{ translate( 'Go back' ) }
				</Button>,

				<Button disabled={ isFetchingRecentPaymentMethods } onClick={ onConfirm } primary scary>
					{ translate( 'Delete payment method' ) }
				</Button>,
			] }
		>
			<h2 className="stored-credit-card-delete-dialog__heading">
				{ translate( 'Delete payment method' ) }
			</h2>

			<p>
				{ translate(
					'The payment method {{paymentMethodSummary/}} will be removed from your account',
					{
						components: {
							paymentMethodSummary: (
								<strong>
									<PaymentMethodSummary
										type={ paymentMethod?.card.brand }
										digits={ paymentMethod?.card.last4 }
									/>
								</strong>
							),
						},
					}
				) }
			</p>

			{ paymentMethod.is_default && (
				<DeletePrimaryCardConfirmation
					card={ paymentMethod.card }
					altCard={ ( recentCards?.items || [] ).find(
						( card: PaymentMethod ) => card.id !== paymentMethod.id
					) }
					isFetching={ isFetchingRecentPaymentMethods }
				/>
			) }
		</Dialog>
	);
};

export default StoredCreditCardDeleteDialog;
