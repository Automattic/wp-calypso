/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';

class PaymentMethodStripePlaceholderDialog extends Component {
	render() {
		const { translate } = this.props;
		const buttons = [
			{ action: 'cancel', disabled: true, label: translate( 'Cancel' ), onClick: noop },
		];

		return (
			<Dialog additionalClassNames="payments__dialog woocommerce" buttons={ buttons } isVisible>
				<div className="stripe__method-edit-header">{ translate( 'Stripe' ) }</div>
				<div className="stripe__method-edit-body placeholder" />
			</Dialog>
		);
	}
}

export default localize( PaymentMethodStripePlaceholderDialog );
