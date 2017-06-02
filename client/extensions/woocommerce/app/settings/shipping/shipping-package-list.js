/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import ExtendedHeader from 'woocommerce/components/extended-header';
import ShippingPackage from './shipping-package';

class ShippingPackageList extends Component {
	constructor( props ) {
		super( props );

		//TODO: use redux state and real data
		this.state = {
			packages: [ {
				type: 'box',
				name: 'Custom Box',
				dimensions: '10 x 10 x 10 in'
			}, {
				type: 'envelope',
				name: 'Custom Envelope',
				dimensions: '12 x 9 x 0.5 in'
			} ],
		};
	}

	renderShippingPackage( pckg, index ) {
		return ( <ShippingPackage key={ index } { ...pckg } /> );
	}

	render() {
		const { translate } = this.props;

		return (
			<div>
				<ExtendedHeader
					label={ translate( 'Packages' ) }
					description={ translate( 'Add frequently used packages to make fulfillment easier.' ) }>
					<Button>{ translate( 'Add package' ) }</Button>
				</ExtendedHeader>
				<Card className="shipping__packages">
					<div className="shipping__packages-row shipping__packages-header">
						<div className="shipping__packages-row-icon"></div>
						<div className="shipping__packages-row-details">{ translate( 'Name' ) }</div>
						<div className="shipping__packages-row-dimensions">{ translate( 'Dimensions' ) }</div>
						<div className="shipping__packages-row-actions" />
					</div>
					{ this.state.packages.map( this.renderShippingPackage ) }
				</Card>
			</div>
		);
	}
}

export default localize( ShippingPackageList );
