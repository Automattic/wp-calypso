import { Button, Dialog } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent } from 'react';

import './style.scss';

interface Props {
	paymentMethodSummary: TranslateResult;
	isVisible: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const PaymentMethodDeleteDialog: FunctionComponent< Props > = ( {
	paymentMethodSummary,
	isVisible,
	onClose,
	onConfirm,
} ) => {
	const translate = useTranslate();
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
