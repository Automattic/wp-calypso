/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import Notice from 'components/notice';
import { updateOrder } from 'woocommerce/state/sites/orders/actions';
import { createNote } from 'woocommerce/state/sites/orders/notes/actions';

class OrderFulfillment extends Component {
	static propTypes = {
		order: PropTypes.shape( {
			id: PropTypes.number.isRequired,
		} ),
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	}

	state = {
		errorMessage: false,
		shouldEmail: false,
		showDialog: false,
		trackingNumber: '',
	}

	isShippable = ( order ) => {
		return ( -1 === [ 'completed', 'failed', 'cancelled', 'refunded' ].indexOf( order.status ) );
	}

	toggleDialog = () => {
		this.setState( {
			showDialog: ! this.state.showDialog,
		} );
	}

	updateTrackingNumber = ( event ) => {
		this.setState( {
			errorMessage: false,
			trackingNumber: event.target.value,
		} );
	}

	updateCustomerEmail = () => {
		this.setState( {
			errorMessage: false,
			shouldEmail: ! this.state.shouldEmail,
		} );
	}

	submit = () => {
		const { order, site, translate } = this.props;
		const { shouldEmail, trackingNumber } = this.state;

		if ( shouldEmail && ! trackingNumber ) {
			this.setState( { errorMessage: translate( 'Please enter a tracking number.' ) } );
			return;
		}

		this.props.updateOrder( site.ID, {
			id: order.id,
			status: 'completed',
		} );

		this.toggleDialog();
		const note = {
			note: translate( 'Your order has been shipped. The tracking number is %(trackingNumber)s.', {
				args: { trackingNumber }
			} ),
			customer_note: shouldEmail,
		};
		if ( trackingNumber ) {
			this.props.createNote( site.ID, order.id, note );
		}
	}

	getFulfillmentStatus = () => {
		const { order, translate } = this.props;
		switch ( order.status ) {
			case 'completed':
				return translate( 'Order has been fulfilled' );
			case 'cancelled':
				return translate( 'Order has been cancelled' );
			case 'refunded':
				return translate( 'Order has been refunded' );
			case 'failed':
				return translate( 'Order has failed' );
			default:
				return translate( 'Order needs to be fulfilled' );
		}
	}

	render() {
		const { order, translate } = this.props;
		const { errorMessage, showDialog, trackingNumber } = this.state;
		const dialogClass = 'woocommerce order-fulfillment'; // eslint/css specificity hack
		if ( ! order ) {
			return null;
		}

		const dialogButtons = [
			<Button onClick={ this.toggleDialog }>{ translate( 'Cancel' ) }</Button>,
			<Button primary onClick={ this.submit }>{ translate( 'Fulfill' ) }</Button>,
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
				<div className="order-fulfillment__action">
					{ ( this.isShippable( order ) )
						? <Button primary onClick={ this.toggleDialog }>{ translate( 'Fulfill' ) }</Button>
						: null
					}
				</div>

				<Dialog isVisible={ showDialog } onClose={ this.toggleDialog } className={ dialogClass } buttons={ dialogButtons }>
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
								placeholder={ translate( 'Tracking Number' ) } />
						</FormFieldset>
						<FormLabel className="order-fulfillment__email">
							<FormInputCheckbox checked={ this.state.shouldEmail } onChange={ this.updateCustomerEmail } />
							<span>{ translate( 'Email tracking number to customer' ) }</span>
						</FormLabel>
						{ errorMessage && <Notice status="is-error" showDismiss={ false }>{ errorMessage }</Notice> }
					</form>
				</Dialog>
			</div>
		);
	}
}

export default connect(
	undefined,
	dispatch => bindActionCreators( { createNote, updateOrder }, dispatch )
)( localize( OrderFulfillment ) );
