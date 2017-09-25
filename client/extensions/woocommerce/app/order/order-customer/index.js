/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import SectionHeader from 'components/section-header';

class OrderCustomerInfo extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			billing: PropTypes.object.isRequired,
			shipping: PropTypes.object.isRequired,
		} ),
	}

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
					<h3 className="order-customer__billing-details">{ translate( 'Billing Details' ) }</h3>
						<h4>{ translate( 'Address' ) }</h4>
						<div className="order-customer__billing-address">
							<p>{ `${ billing.first_name } ${ billing.last_name }` }</p>
							<p>{ billing.address_1 }</p>
							<p>{ billing.address_2 }</p>
							<p>{ `${ billing.city }, ${ billing.state } ${ billing.postcode }` }</p>
							<p>{ billing.country }</p>
						</div>

						<h4>{ translate( 'Email' ) }</h4>
						<p>{ billing.email }</p>

						<h4>{ translate( 'Phone' ) }</h4>
						<span>{ billing.phone }</span>
					</div>

					<div className="order-customer__shipping">
						<h3 className="order-customer__shipping-details">{ translate( 'Shipping Details' ) }</h3>
						<h4>{ translate( 'Address' ) }</h4>
						<div className="order-customer__shipping-address">
							<p>{ `${ shipping.first_name } ${ shipping.last_name }` }</p>
							<p>{ shipping.address_1 }</p>
							<p>{ shipping.address_2 }</p>
							<p>{ `${ shipping.city }, ${ shipping.state } ${ shipping.postcode }` }</p>
							<p>{ shipping.country }</p>
						</div>
					</div>
				</div>
				</Card>
			</div>
		);
	}
}

export default localize( OrderCustomerInfo );
