/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';

const PaymentMethodItemPlaceHolder = () => {
	return (
		<ListItem>
			<ListItemField className="payments__method-method-suggested-container">
				<span className="payments__method-loading-suggested" />
				<span className="payments__method-loading-title" />
			</ListItemField>
			<ListItemField className="payments__method-method-information-container">
				<span className="payments__method-loading-fee" />
				<span className="payments__method-loading-feelink" />
			</ListItemField>
			<ListItemField className="payments__method-enable-container">
				<span className="payments__method-loading-enabled" />
			</ListItemField>
			<ListItemField className="payments__method-action-container">
				<span className="payments__method-loading-settings" />
			</ListItemField>
		</ListItem>
	);
};

export default PaymentMethodItemPlaceHolder;
