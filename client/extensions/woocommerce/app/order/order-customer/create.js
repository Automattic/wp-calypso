/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { every, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import { Button, Card } from '@automattic/components';
import CustomerAddressDialog from './dialog';
import {
	areLocationsLoaded,
	getAllCountries,
} from 'woocommerce/state/sites/data/locations/selectors';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import { fetchLocations } from 'woocommerce/state/sites/data/locations/actions';
import getAddressViewFormat from 'woocommerce/lib/get-address-view-format';
import { getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import SectionHeader from 'components/section-header';

class OrderCustomerInfo extends Component {
	static propTypes = {
		countries: PropTypes.arrayOf(
			PropTypes.shape( {
				code: PropTypes.string.isRequired,
				name: PropTypes.string.isRequired,
				states: PropTypes.arrayOf(
					PropTypes.shape( {
						code: PropTypes.string.isRequired,
						name: PropTypes.string.isRequired,
					} )
				),
			} )
		),
		editOrder: PropTypes.func.isRequired,
		loadedLocations: PropTypes.bool,
		orderId: PropTypes.oneOfType( [
			PropTypes.number, // A number indicates an existing order
			PropTypes.shape( { id: PropTypes.string } ), // Placeholders have format { id: 'order_1' }
		] ).isRequired,
		siteId: PropTypes.number.isRequired,
	};

	state = {
		showDialog: false,
	};

	maybeFetchLocations = () => {
		const { loadedLocations, siteId } = this.props;

		if ( siteId && ! loadedLocations ) {
			this.props.fetchLocations( siteId );
		}
	};

	componentDidMount = () => {
		this.maybeFetchLocations( this.props );
	};

	componentDidUpdate = () => {
		this.maybeFetchLocations( this.props );
	};

	updateAddress = ( type = 'billing' ) => {
		const { siteId, order } = this.props;
		return ( address ) => {
			const { copyToShipping = false, ...newAddress } = address;
			if ( siteId ) {
				this.props.editOrder( siteId, { id: order.id, [ type ]: newAddress } );
				if ( copyToShipping && 'billing' === type ) {
					this.props.editOrder( siteId, { id: order.id, shipping: newAddress } );
				}
			}
		};
	};

	toggleDialog = ( type ) => {
		return () => {
			this.setState( { showDialog: type } );
		};
	};

	renderDialogs = () => {
		const { billing, shipping } = this.props.order;
		return [
			<CustomerAddressDialog
				key="dialog-billing"
				address={ billing }
				closeDialog={ this.toggleDialog( false ) }
				isBilling
				isVisible={ 'billing' === this.state.showDialog }
				updateAddress={ this.updateAddress( 'billing' ) }
			/>,
			<CustomerAddressDialog
				key="dialog-shipping"
				address={ shipping }
				closeDialog={ this.toggleDialog( false ) }
				isVisible={ 'shipping' === this.state.showDialog }
				updateAddress={ this.updateAddress( 'shipping' ) }
			/>,
		];
	};

	renderBilling = ( address = {} ) => {
		const { countries, loadedLocations, translate } = this.props;
		if ( ! loadedLocations ) {
			return null;
		}

		if ( every( address, isEmpty ) ) {
			return (
				<Button
					className="order-customer__add-link"
					onClick={ this.toggleDialog( 'billing' ) }
					primary
				>
					{ translate( 'Add billing address' ) }
				</Button>
			);
		}
		return (
			<Fragment>
				<h4>{ translate( 'Address' ) }</h4>
				<div className="order-customer__billing-address">
					<p>{ `${ address.first_name } ${ address.last_name }` }</p>
					<AddressView address={ getAddressViewFormat( address ) } countries={ countries } />
				</div>

				<h4>{ translate( 'Email' ) }</h4>
				<p>{ address.email }</p>

				<h4>{ translate( 'Phone' ) }</h4>
				<div className="order-customer__billing-phone">{ address.phone }</div>
				<Button className="order-customer__add-link" onClick={ this.toggleDialog( 'billing' ) }>
					{ translate( 'Edit Address' ) }
				</Button>
			</Fragment>
		);
	};

	renderShipping = ( address = {} ) => {
		const { countries, loadedLocations, translate } = this.props;
		if ( ! loadedLocations ) {
			return null;
		}

		if ( every( address, isEmpty ) ) {
			return (
				<Button
					className="order-customer__add-link"
					onClick={ this.toggleDialog( 'shipping' ) }
					primary
				>
					{ translate( 'Add shipping address' ) }
				</Button>
			);
		}
		return (
			<Fragment>
				<h4>{ translate( 'Address' ) }</h4>
				<div className="order-customer__shipping-address">
					<p>{ `${ address.first_name } ${ address.last_name }` }</p>
					<AddressView address={ getAddressViewFormat( address ) } countries={ countries } />
				</div>
				<Button className="order-customer__add-link" onClick={ this.toggleDialog( 'shipping' ) }>
					{ translate( 'Edit Address' ) }
				</Button>
			</Fragment>
		);
	};

	render() {
		const { orderId, order = {}, translate } = this.props;
		if ( ! orderId ) {
			return null;
		}

		return (
			<div className="order-customer__create order-customer">
				<SectionHeader label={ translate( 'Customer information' ) } />
				<Card>
					<div className="order-customer__container">
						<div className="order-customer__billing">
							<h3 className="order-customer__billing-details">
								{ translate( 'Billing details' ) }
							</h3>
							{ this.renderBilling( order.billing ) }
						</div>

						<div className="order-customer__shipping">
							<h3 className="order-customer__shipping-details">
								{ translate( 'Shipping details' ) }
							</h3>
							{ this.renderShipping( order.shipping ) }
						</div>
					</div>
				</Card>
				{ this.renderDialogs() }
			</div>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const order = getOrderWithEdits( state );

		const loadedLocations = areLocationsLoaded( state, siteId );
		const countries = getAllCountries( state, siteId );

		return {
			countries,
			loadedLocations,
			order,
			siteId,
		};
	},
	( dispatch ) => bindActionCreators( { editOrder, fetchLocations }, dispatch )
)( localize( OrderCustomerInfo ) );
