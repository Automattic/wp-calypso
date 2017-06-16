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
			<ListItemField>
				<span className="payments__method-loading-suggested"></span>
				<span className="payments__method-loading-title"></span>
			</ListItemField>
			<ListItemField>
				<span className="payments__method-loading-fee"></span>
				<span className="payments__method-loading-feelink"></span>
			</ListItemField>
			<ListItemField>
				<span className="payments__method-loading-settings"></span>
			</ListItemField>
		</ListItem>
	);
};

export default PaymentMethodItemPlaceHolder;
