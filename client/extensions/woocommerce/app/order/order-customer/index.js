/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import Button from 'components/button';
import Card from 'components/card';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import { isCurrentlyEditingOrder, getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import getAddressViewFormat from 'woocommerce/lib/get-address-view-format';
import { getOrder } from 'woocommerce/state/sites/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import SectionHeader from 'components/section-header';

const CustomerAddressDialog = () => null;

class OrderCustomerInfo extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
		order: PropTypes.shape( {
			billing: PropTypes.object.isRequired,
			shipping: PropTypes.object.isRequired,
		} ),
	};

	toggleDialog = () => {
		return () => {};
	};

	render() {
		const { isEditing, order, translate } = this.props;
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
								{ isEditing ? (
									<Button
										borderless
										compact
										className="order-customer__edit-link"
										onClick={ this.toggleDialog( 'billing' ) }
									>
										{ translate( 'edit' ) }
									</Button>
								) : null }
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
								{ isEditing ? (
									<Button
										borderless
										compact
										className="order-customer__edit-link"
										onClick={ this.toggleDialog( 'shipping' ) }
									>
										{ translate( 'edit' ) }
									</Button>
								) : null }
							</h3>
							<h4>{ translate( 'Address' ) }</h4>
							<div className="order-customer__shipping-address">
								<p>{ `${ shipping.first_name } ${ shipping.last_name }` }</p>
								<AddressView address={ getAddressViewFormat( shipping ) } />
							</div>
						</div>
					</div>
				</Card>
				<CustomerAddressDialog />
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const isEditing = isCurrentlyEditingOrder( state );
		const order = isEditing ? getOrderWithEdits( state ) : getOrder( state, props.orderId );

		return {
			isEditing,
			order,
			site,
			siteId,
		};
	},
	dispatch => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderCustomerInfo ) );
