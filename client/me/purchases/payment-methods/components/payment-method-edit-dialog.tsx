import { Button, Dialog } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import CardHeading from 'calypso/components/card-heading';
import Notice from 'calypso/components/notice';
import type { TranslateResult } from 'i18n-calypso';
import type { FunctionComponent } from 'react';

import 'calypso/me/purchases/payment-methods/style.scss';

interface Props {
	paymentMethodSummary: TranslateResult;
	isVisible: boolean;
	onClose: () => void;
	onConfirm: () => void;
	form: JSX.Element;
	error: string;
}

const PaymentMethodEditDialog: FunctionComponent< Props > = ( {
	paymentMethodSummary,
	isVisible,
	onClose,
	onConfirm,
	form,
	error,
} ) => {
	const translate = useTranslate();

	return (
		<Dialog
			isVisible={ isVisible }
			additionalClassNames="payment-method-edit-dialog"
			onClose={ onClose }
			buttons={ [
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>,
				<Button onClick={ onConfirm } primary>
					{ translate( 'Save' ) }
				</Button>,
			] }
		>
			<CardHeading tagName="h2" size={ 24 }>
				{ translate( 'Update Your Payment Method' ) }
			</CardHeading>
			<p>
				{ translate( 'Please update the following information for {{paymentMethodSummary/}}', {
					components: {
						paymentMethodSummary: <strong>{ paymentMethodSummary }</strong>,
					},
				} ) }
			</p>
			{ error && <Notice status="is-error" isCompact={ true } text={ error } /> }
			{ form }
		</Dialog>
	);
};

export default PaymentMethodEditDialog;
