import { Button, Dialog } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { FunctionComponent } from 'react';
import CardHeading from 'calypso/components/card-heading';

import 'calypso/me/purchases/payment-methods/style.scss';

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
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>,
				<Button onClick={ onConfirm } primary>
					{ translate( 'Delete' ) }
				</Button>,
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
		</Dialog>
	);
};

export default PaymentMethodDeleteDialog;
