/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { first, includes } from 'lodash';
import Gridicon from 'components/gridicon';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	areLabelsEnabled,
	getSelectedPaymentMethodId,
} from 'woocommerce/woocommerce-services/state/label-settings/selectors';
import {
	areLabelsFullyLoaded,
	getLabels,
	isLabelDataFetchError,
} from 'woocommerce/woocommerce-services/state/shipping-label/selectors';
import {
	ACCEPTED_USPS_ORIGIN_COUNTRIES,
	US_MILITARY_STATES,
	DOMESTIC_US_TERRITORIES,
} from 'woocommerce/woocommerce-services/state/shipping-label/constants';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import { Button, Dialog } from '@automattic/components';
import { createNote } from 'woocommerce/state/sites/orders/notes/actions';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormTextInput from 'components/forms/form-text-input';
import { isOrderFinished } from 'woocommerce/lib/order-status';
import { isOrderUpdating } from 'woocommerce/state/sites/orders/selectors';
import { isWcsEnabled, isWcsInternationalLabelsEnabled } from 'woocommerce/state/selectors/plugins';
import LabelPurchaseDialog from 'woocommerce/woocommerce-services/views/shipping-label/label-purchase-modal';
import Notice from 'components/notice';
import { openPrintingFlow } from 'woocommerce/woocommerce-services/state/shipping-label/actions';
import QueryLabels from 'woocommerce/woocommerce-services/components/query-labels';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';
import { saveOrder } from 'woocommerce/state/sites/orders/actions';

class OrderFulfillment extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			id: PropTypes.number.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	};

	state = {
		errorMessage: false,
		shouldEmail: false,
		showDialog: false,
		trackingNumber: '',
	};

	toggleDialog = ( event ) => {
		event && event.preventDefault();
		this.setState( {
			showDialog: ! this.state.showDialog,
		} );
	};

	updateTrackingNumber = ( event ) => {
		this.setState( {
			errorMessage: false,
			trackingNumber: event.target.value,
		} );
	};

	updateCustomerEmail = () => {
		this.setState( {
			errorMessage: false,
			shouldEmail: ! this.state.shouldEmail,
		} );
	};

	submit = () => {
		const { order, site, translate } = this.props;
		const { shouldEmail, trackingNumber } = this.state;

		if ( shouldEmail && ! trackingNumber ) {
			this.setState( { errorMessage: translate( 'Please enter a tracking number.' ) } );
			return;
		}

		this.props.saveOrder( site.ID, {
			id: order.id,
			status: 'completed',
		} );

		this.toggleDialog();
		const note = {
			note: translate( 'Your order has been shipped. The tracking number is %(trackingNumber)s.', {
				args: { trackingNumber },
			} ),
			customer_note: shouldEmail,
		};
		if ( trackingNumber ) {
			this.props.createNote( site.ID, order.id, note );
		}
	};

	getOrderFulfilledMessage = () => {
		const { labelsLoaded, labels, translate } = this.props;
		const unknownCarrierMessage = translate( 'Order has been fulfilled' );
		if ( ! labelsLoaded || ! labels.length ) {
			return unknownCarrierMessage;
		}

		const label = first( this.props.labels );
		if ( ! label || 'usps' !== label.carrier_id ) {
			return unknownCarrierMessage;
		}

		return translate( 'Order has been fulfilled and will be shipped via USPS' );
	};

	getFulfillmentStatus = () => {
		const { order, translate } = this.props;
		switch ( order.status ) {
			case 'completed':
				return this.getOrderFulfilledMessage();
			case 'cancelled':
				return translate( 'Order has been cancelled' );
			case 'refunded':
				return translate( 'Order has been refunded' );
			case 'failed':
				return translate( 'Order has failed' );
			default:
				return translate( 'Order needs to be fulfilled' );
		}
	};

	isAddressValidForLabels( address, type ) {
		if ( this.props.internationalLabelsEnabled ) {
			// If international labels is enabled, origin must be a country with a USPS office, destination can be anywhere in the world
			return 'destination' === type || includes( ACCEPTED_USPS_ORIGIN_COUNTRIES, address.country );
		}

		// If international labels is disabled, restrict origin and destination to "domestic", that is, US, Puerto Rico and Virgin Islands
		if ( ! DOMESTIC_US_TERRITORIES.includes( address.country ) ) {
			return false;
		}

		// Disable US military addresses too, since they require customs form
		if ( 'US' === address.country && US_MILITARY_STATES.includes( address.state ) ) {
			return false;
		}

		return true;
	}

	shouldShowLabels() {
		const { labelsLoaded, labelsEnabled, order, storeAddress, hasLabelsPaymentMethod } = this.props;

		if ( ! labelsLoaded ) {
			return false;
		}

		const { shipping } = order;

		return (
			labelsEnabled &&
			hasLabelsPaymentMethod &&
			this.isAddressValidForLabels( storeAddress, 'origin' ) &&
			this.isAddressValidForLabels( shipping, 'destination' )
		);
	}

	renderFulfillmentAction() {
		const { wcsEnabled, isSaving, labelsLoaded, labelsError, order, site, translate } = this.props;
		const orderFinished = isOrderFinished( order.status );
		const labelsLoading = wcsEnabled && ! labelsLoaded;

		if ( orderFinished ) {
			return null;
		}

		if ( ! labelsError && labelsLoading ) {
			const buttonClassName = 'is-placeholder';
			return <Button className={ buttonClassName }>{ translate( 'Fulfill' ) }</Button>;
		}

		if ( ! this.shouldShowLabels() ) {
			return (
				<Button primary onClick={ this.toggleDialog } busy={ isSaving } disabled={ isSaving }>
					{ translate( 'Fulfill' ) }
				</Button>
			);
		}

		const onLabelPrint = () => this.props.openPrintingFlow( order.id, site.ID );

		return (
			<div className="order-fulfillment__print-container">
				<Button borderless onClick={ this.toggleDialog } busy={ isSaving } disabled={ isSaving }>
					{ translate( 'Fulfill without printing a label' ) }
				</Button>
				<Button
					primary={ labelsLoaded }
					onClick={ onLabelPrint }
					busy={ isSaving }
					disabled={ isSaving }
				>
					{ translate( 'Print label & fulfill' ) }
				</Button>
			</div>
		);
	}

	render() {
		const { wcsEnabled, order, site, translate } = this.props;
		const { errorMessage, showDialog, trackingNumber } = this.state;
		const dialogClass = 'woocommerce order-fulfillment'; // eslint/css specificity hack
		if ( ! order ) {
			return null;
		}

		const dialogButtons = [
			<Button onClick={ this.toggleDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.submit }>
				{ translate( 'Fulfill' ) }
			</Button>,
		];

		const classes = classNames( {
			'order-fulfillment': true,
			'is-completed': 'completed' === order.status,
		} );

		return (
			<div className={ classes }>
				<div className="order-fulfillment__label">
					<Gridicon icon={ 'completed' === order.status ? 'checkmark' : 'shipping' } />
					{ this.getFulfillmentStatus() }
				</div>
				<div className="order-fulfillment__action">{ this.renderFulfillmentAction() }</div>

				<Dialog
					isVisible={ showDialog }
					onClose={ this.toggleDialog }
					className={ dialogClass }
					buttons={ dialogButtons }
				>
					<h1>{ translate( 'Fulfill order' ) }</h1>
					<form>
						<FormFieldset className="order-fulfillment__tracking">
							<FormLabel className="order-fulfillment__tracking-label" htmlFor="tracking-number">
								{ translate( 'Enter a tracking number (optional)' ) }
							</FormLabel>
							<FormTextInput
								id="tracking-number"
								className="order-fulfillment__value"
								value={ trackingNumber }
								onChange={ this.updateTrackingNumber }
								placeholder={ translate( 'Tracking Number' ) }
							/>
						</FormFieldset>
						<FormLabel className="order-fulfillment__email">
							<FormInputCheckbox
								checked={ this.state.shouldEmail }
								onChange={ this.updateCustomerEmail }
							/>
							<span>{ translate( 'Email tracking number to customer' ) }</span>
						</FormLabel>
						{ errorMessage && (
							<Notice status="is-error" showDismiss={ false }>
								{ errorMessage }
							</Notice>
						) }
					</form>
				</Dialog>
				<QuerySettingsGeneral siteId={ site.ID } />
				{ wcsEnabled && <QueryLabels orderId={ order.id } siteId={ site.ID } /> }
				{ wcsEnabled && <LabelPurchaseDialog orderId={ order.id } siteId={ site.ID } /> }
			</div>
		);
	}
}

export default connect(
	( state, { order, site } ) => {
		const wcsEnabled = isWcsEnabled( state, site.ID );
		const labelsLoaded =
			wcsEnabled &&
			Boolean( areLabelsFullyLoaded( state, order.id, site.ID ) ) &&
			areSettingsGeneralLoaded( state );
		const hasLabelsPaymentMethod =
			wcsEnabled && labelsLoaded && getSelectedPaymentMethodId( state, site.ID );
		const storeAddress = labelsLoaded && getStoreLocation( state );
		const isSaving = isOrderUpdating( state, order.id );

		return {
			wcsEnabled,
			internationalLabelsEnabled: isWcsInternationalLabelsEnabled( state, site.ID ),
			isSaving,
			labelsLoaded,
			labelsError: isLabelDataFetchError( state, order.id, site.ID ),
			labelsEnabled: areLabelsEnabled( state, site.ID ),
			labels: getLabels( state, order.id, site.ID ),
			hasLabelsPaymentMethod,
			storeAddress,
		};
	},
	( dispatch ) => bindActionCreators( { createNote, saveOrder, openPrintingFlow }, dispatch )
)( localize( OrderFulfillment ) );
