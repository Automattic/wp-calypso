/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import Card from 'components/card';
import getAddressViewFormat from 'woocommerce/lib/get-address-view-format';
import SectionHeader from 'components/section-header';

class OrderCustomerInfo extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			billing: PropTypes.object.isRequired,
			shipping: PropTypes.object.isRequired,
		} ),
	};

	render() {
		const { order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const { billing, shipping } = order;

		return (
			<div className="order-customer">
				<SectionHeader label={ translate( 'Customer Information' ) } />
				<Card>
					<div className="order-customer__container">
						<div className="order-customer__billing">
							<h3 className="order-customer__billing-details">
								{ translate( 'Billing Details' ) }
							</h3>
							<h4>{ translate( 'Address' ) }</h4>
							<div className="order-customer__billing-address">
								<p>{ `${ billing.first_name } ${ billing.last_name }` }</p>
								<AddressView address={ getAddressViewFormat( billing ) } />
							</div>

							<h4>{ translate( 'Email' ) }</h4>
							<p>{ billing.email }</p>

							<h4>{ translate( 'Phone' ) }</h4>
							<span>{ billing.phone }</span>
						</div>

						<div className="order-customer__shipping">
							<h3 className="order-customer__shipping-details">
								{ translate( 'Shipping Details' ) }
							</h3>
							<h4>{ translate( 'Address' ) }</h4>
							<div className="order-customer__shipping-address">
								<p>{ `${ shipping.first_name } ${ shipping.last_name }` }</p>
								<AddressView address={ getAddressViewFormat( shipping ) } />
							</div>
						</div>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( OrderCustomerInfo );
