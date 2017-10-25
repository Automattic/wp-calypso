/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class OrderAddItems extends Component {
	render() {
		const { translate } = this.props;
		return (
			<div className="order-details__actions">
				<Button borderless>{ translate( '+ Add Product' ) }</Button>
				<Button borderless>{ translate( '+ Add Fee' ) }</Button>
			</div>
		);
	}
}

export default localize( OrderAddItems );
