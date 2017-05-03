/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ShippingHeader from './shipping-header';
import ShippingPackage from './shipping-package';

class ShippingPackageList extends Component {
	render() {
		const __ = i18n.translate;

		return (
			<div>
				<ShippingHeader
					label={ __( 'Packages' ) }
					description={ __( 'Add any frequently used packages here to make fulfillment easier' ) }>
					<Button>{ __( 'Add package' ) }</Button>
				</ShippingHeader>
				<Card className="shipping__packages">
					<div className="shipping__packages-row shipping__packages-header">
						<div className="shipping__packages-row-icon"></div>
						<div className="shipping__packages-row-details">{ __( 'Name' ) }</div>
						<div className="shipping__packages-row-dimensions">{ __( 'Dimensions' ) }</div>
						<div className="shipping__packages-row-actions" />
					</div>
					<ShippingPackage
						type="box"
						name="Custom Box"
						dimensions="10 x 10 x 10 in" />
					<ShippingPackage
						type="envelope"
						name="Custom Envelope"
						dimensions="12 x 9 x 0.5 in" />
				</Card>
			</div>
		);
	}
}

export default ShippingPackageList;
