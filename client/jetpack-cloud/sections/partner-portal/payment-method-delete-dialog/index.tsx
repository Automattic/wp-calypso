import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import { getPaymentMethodSummary } from 'calypso/lib/checkout/payment-methods';
import type { PaymentMethod } from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods';
import type { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	paymentMethod: PaymentMethod;
	isVisible: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const PaymentMethodDeleteDialog: FunctionComponent< Props > = ( {
	paymentMethod,
	isVisible,
	onClose,
	onConfirm,
} ) => {
	const translate = useTranslate();

	const paymentMethodSummary = getPaymentMethodSummary( {
		translate,
		type: paymentMethod?.card.brand,
		digits: paymentMethod?.card.last4,
	} );

	return (
		<Dialog
			isVisible={ isVisible }
			additionalClassNames="payment-method-delete-dialog"
			onClose={ onClose }
			buttons={ [
				<Button disabled={ false } onClick={ onClose }>
					{ translate( 'Go back' ) }
				</Button>,

				<Button onClick={ onConfirm } primary scary>
					{ translate( 'Delete payment method' ) }
				</Button>,
			] }
		>
			<h2 className="payment-method-delete-dialog__heading">
				{ translate( 'Delete payment method' ) }
			</h2>
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
		</Dialog>
	);
};

export default PaymentMethodDeleteDialog;
