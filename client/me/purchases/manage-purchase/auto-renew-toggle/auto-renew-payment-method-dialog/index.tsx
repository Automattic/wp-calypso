import { Dialog } from '@automattic/components';
import { localize, type LocalizeProps } from 'i18n-calypso';
import { Component } from 'react';
import type { Purchases } from '@automattic/data-stores';

import './style.scss';

interface AutoRenewPaymentMethodDialogProps {
	isVisible: boolean;
	purchase: Purchases.Purchase;
	onClose: () => void;
	onAddClick: () => void;
}

class AutoRenewPaymentMethodDialog extends Component<
	AutoRenewPaymentMethodDialogProps & LocalizeProps
> {
	render() {
		const { isVisible, translate } = this.props;
		const buttons = [
			{
				action: 'close',
				label: translate( 'Cancel' ),
				onClick: this.props.onClose,
			},
			{
				action: 'add',
				label: translate( 'Add a payment method' ),
				onClick: this.props.onAddClick,
				isPrimary: true,
			},
		];

		return (
			<Dialog
				isVisible={ isVisible }
				additionalClassNames="auto-renew-payment-method-dialog"
				onClose={ this.props.onClose }
				buttons={ buttons }
			>
				<h2 className="auto-renew-payment-method-dialog__header">
					{ translate( 'Turn on auto-renew' ) }
				</h2>
				<p>
					{ translate(
						"We currently don't have any payment details on file for this purchase to automatically renew it " +
							'for you. Please add a payment method so we can continue your service without interruptions.'
					) }
				</p>
			</Dialog>
		);
	}
}

export default localize( AutoRenewPaymentMethodDialog );
