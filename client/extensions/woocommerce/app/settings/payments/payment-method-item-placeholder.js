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
				<span className="payments__method-loading-suggested"></span>
				<span className="payments__method-loading-title"></span>
			</ListItemField>
			<ListItemField className="payments__method-method-information-container">
				<span className="payments__method-loading-fee"></span>
				<span className="payments__method-loading-feelink"></span>
			</ListItemField>
			<ListItemField className="payments__method-enable-container">
				<span className="payments__method-loading-enabled"></span>
			</ListItemField>
			<ListItemField className="payments__method-action-container">
				<span className="payments__method-loading-settings"></span>
			</ListItemField>
		</ListItem>
	);
};

export default PaymentMethodItemPlaceHolder;
