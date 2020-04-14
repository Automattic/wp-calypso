/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button, Dialog } from '@automattic/components';
import './style.scss';

interface Props {
	isVisible: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const PaymentMethodDeleteDialog: FunctionComponent< Props > = ( {
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
		>
			<h2 className="payment-method-delete-dialog__header">
				{ translate( 'Remove payment method?' ) }
			</h2>
			<p>
				{ translate(
					'The payment method will be removed from your account and from all the associated subscriptions.'
				) }
			</p>
			<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>
			<Button onClick={ onConfirm } primary>
				{ translate( 'Confirm' ) }
			</Button>
		</Dialog>
	);
};

export default PaymentMethodDeleteDialog;
