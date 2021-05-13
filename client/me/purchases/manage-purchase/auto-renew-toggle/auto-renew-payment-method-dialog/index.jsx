/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class AutoRenewPaymentMethodDialog extends Component {
	static propTypes = {
		isVisible: PropTypes.bool,
		translate: PropTypes.func.isRequired,
		purchase: PropTypes.object.isRequired,
		onClose: PropTypes.func.isRequired,
		onAddClick: PropTypes.func.isRequired,
	};

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
