/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';

class ShippingPackage extends Component {
	render() {
		const { type, name, dimensions } = this.props;
		const icon = 'envelope' === type ? 'mail' : 'product';
		const __ = i18n.translate;

		return (
			<div className="shipping__packages-row">
				<div className="shipping__packages-row-icon">
					<Gridicon icon={ icon } size={ 18 } />
				</div>
				<div className="shipping__packages-row-details">
					<div className="shipping__packages-row-details-name">{ name }</div>
				</div>
				<div className="shipping__packages-row-dimensions">{ dimensions }</div>
				<div className="shipping__packages-row-actions">
					<Button compact>{ __( 'Edit' ) }</Button>
				</div>
			</div>
		);
	}
}

export default ShippingPackage;
