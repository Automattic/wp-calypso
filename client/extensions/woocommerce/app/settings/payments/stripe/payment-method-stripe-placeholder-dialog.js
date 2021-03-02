/**
 * External dependencies
 */

import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';

const PaymentMethodStripePlaceholderDialog = ( { translate } ) => {
	const buttons = [
		{ action: 'cancel', disabled: true, label: translate( 'Cancel' ), onClick: () => {} },
	];

	return (
		<Dialog additionalClassNames="payments__dialog woocommerce" buttons={ buttons } isVisible>
			<div className="stripe__method-edit-header">{ translate( 'Stripe' ) }</div>
			<div className="stripe__method-edit-body placeholder" />
		</Dialog>
	);
};

export default localize( PaymentMethodStripePlaceholderDialog );
