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
import { Button, Card } from '@automattic/components';
import CustomerAddressDialog from './dialog';
import {
	areLocationsLoaded,
	getAllCountries,
} from 'woocommerce/state/sites/data/locations/selectors';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import { fetchLocations } from 'woocommerce/state/sites/data/locations/actions';
import { isCurrentlyEditingOrder, getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { isOrderFinished } from 'woocommerce/lib/order-status';
import getAddressViewFormat from 'woocommerce/lib/get-address-view-format';
import { getOrder } from 'woocommerce/state/sites/orders/selectors';
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
		isEditing: PropTypes.bool,
		loadedLocations: PropTypes.bool,
		orderId: PropTypes.oneOfType( [
			PropTypes.number, // A number indicates an existing order
			PropTypes.shape( { id: PropTypes.string } ), // Placeholders have format { id: 'order_1' }
		] ).isRequired,
		order: PropTypes.shape( {
			billing: PropTypes.object.isRequired,
			shipping: PropTypes.object.isRequired,
		} ),
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
		const { siteId } = this.props;
		const { billing, shipping } = this.props.order;
		return [
			<CustomerAddressDialog
				key="dialog-billing"
				address={ billing }
				closeDialog={ this.toggleDialog( false ) }
				isBilling
				isVisible={ 'billing' === this.state.showDialog }
				siteId={ siteId }
				updateAddress={ this.updateAddress( 'billing' ) }
			/>,
			<CustomerAddressDialog
				key="dialog-shipping"
				address={ shipping }
				closeDialog={ this.toggleDialog( false ) }
				isVisible={ 'shipping' === this.state.showDialog }
				siteId={ siteId }
				updateAddress={ this.updateAddress( 'shipping' ) }
			/>,
		];
	};

	render() {
		const { countries, isEditing, loadedLocations, order, translate } = this.props;
		if ( ! order || ! loadedLocations ) {
			return null;
		}

		const { billing, shipping } = order;
		const isEditable = isEditing && ! isOrderFinished( order.status );

		return (
			<div className="order-customer">
				<SectionHeader label={ translate( 'Customer information' ) } />
				<Card>
					<div className="order-customer__container">
						<div className="order-customer__billing">
							<h3 className="order-customer__billing-details">
								{ translate( 'Billing details' ) }
								{ isEditable ? (
									<Button
										compact
										className="order-customer__edit-link"
										onClick={ this.toggleDialog( 'billing' ) }
										borderless
									>
										{ translate( 'Edit' ) }
									</Button>
								) : null }
							</h3>
							<h4>{ translate( 'Address' ) }</h4>
							<div className="order-customer__billing-address">
								<p>{ `${ billing.first_name } ${ billing.last_name }` }</p>
								<AddressView address={ getAddressViewFormat( billing ) } countries={ countries } />
							</div>

							<h4>{ translate( 'Email' ) }</h4>
							<p>{ billing.email }</p>

							<h4>{ translate( 'Phone' ) }</h4>
							<span>{ billing.phone }</span>
						</div>

						<div className="order-customer__shipping">
							<h3 className="order-customer__shipping-details">
								{ translate( 'Shipping details' ) }
								{ isEditable ? (
									<Button
										compact
										className="order-customer__edit-link"
										onClick={ this.toggleDialog( 'shipping' ) }
										borderless
									>
										{ translate( 'Edit' ) }
									</Button>
								) : null }
							</h3>
							<h4>{ translate( 'Address' ) }</h4>
							<div className="order-customer__shipping-address">
								<p>{ `${ shipping.first_name } ${ shipping.last_name }` }</p>
								<AddressView address={ getAddressViewFormat( shipping ) } countries={ countries } />
							</div>
						</div>
					</div>
				</Card>
				{ isEditing && this.renderDialogs() }
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );
		const isEditing = isCurrentlyEditingOrder( state );
		const order = isEditing ? getOrderWithEdits( state ) : getOrder( state, props.orderId );

		const loadedLocations = areLocationsLoaded( state, siteId );
		const countries = getAllCountries( state, siteId );

		return {
			countries,
			isEditing,
			loadedLocations,
			order,
			siteId,
		};
	},
	( dispatch ) => bindActionCreators( { editOrder, fetchLocations }, dispatch )
)( localize( OrderCustomerInfo ) );
