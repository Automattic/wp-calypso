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

class Packages extends Component {
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
					description={ translate( 'Add the boxes, envelopes, and other packages you use most frequently.' ) }>
					<Button>{ translate( 'Add package' ) }</Button>
				</ExtendedHeader>
				<Card className="packages__packages">
					<div className="packages__packages-row packages__packages-header">
						<div className="packages__packages-row-icon"></div>
						<div className="packages__packages-row-details">{ translate( 'Name' ) }</div>
						<div className="packages__packages-row-dimensions">{ translate( 'Dimensions' ) }</div>
						<div className="packages__packages-row-actions" />
					</div>
					{ this.state.packages.map( this.renderShippingPackage ) }
				</Card>
			</div>
		);
	}
}

export default localize( Packages );
