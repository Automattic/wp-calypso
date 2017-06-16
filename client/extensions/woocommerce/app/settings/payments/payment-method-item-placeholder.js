/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ListItem from 'woocommerce/components/list/list-item';
import ListItemField from 'woocommerce/components/list/list-item-field';

class PaymentMethodItemPlaceHolder extends Component {

	render() {
		return (
			<ListItem>
				<ListItemField>
					<span className="payments__method-loading-suggested"></span>
					<span className="payments__method-loading-title"></span>
				</ListItemField>
				<ListItemField className="payments__method-loading">
					<span className="payments__method-loading-fee"></span>
					<span className="payments__method-loading-feelink"></span>
				</ListItemField>
				<ListItemField className="payments__method-loading">
					<span className="payments__method-loading-settings"></span>
				</ListItemField>
			</ListItem>
		);
	}
}

export default PaymentMethodItemPlaceHolder;
