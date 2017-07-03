/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';

/**
 * Internal dependencies
 */
import { createNote } from 'woocommerce/state/sites/orders/notes/actions';
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormTextInput from 'components/forms/form-text-input';
import Notice from 'components/notice';
import { updateOrder } from 'woocommerce/state/sites/orders/actions';

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
		shouldEmail: true,
		showDialog: false,
		trackingNumber: '',
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

	render() {
		const { order, translate } = this.props;
		const { errorMessage, showDialog, trackingNumber } = this.state;
		const dialogClass = 'woocommerce order__fulfillment'; // eslint/css specificity hack
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order__details-fulfillment">
				<div className="order__details-fulfillment-label">
					<Gridicon icon="shipping" />
					{ translate( 'Order needs to be fulfilled' ) }
				</div>
				<div className="order__details-fulfillment-action">
					<Button primary onClick={ this.toggleDialog }>{ translate( 'Fulfill' ) }</Button>
				</div>
				<Dialog isVisible={ showDialog } onClose={ this.toggleDialog } className={ dialogClass }>
					<h1>{ translate( 'Fulfill order' ) }</h1>
					<form>
						<FormFieldset className="order__fulfillment-tracking">
							<FormLabel className="order__fulfillment-tracking-label" htmlFor="tracking-number">
								{ translate( 'Enter a tracking number (optional)' ) }
							</FormLabel>
							<FormTextInput
								id="tracking-number"
								className="order__fulfillment-value"
								value={ trackingNumber }
								onChange={ this.updateTrackingNumber }
								placeholder={ translate( 'Tracking Number' ) } />
						</FormFieldset>
						<FormLabel className="order__fulfillment-email">
							<FormInputCheckbox checked={ this.state.shouldEmail } onChange={ this.updateCustomerEmail } />
							<span>{ translate( 'Email tracking number to customer' ) }</span>
						</FormLabel>
						<div className="order__fulfillment-actions">
							{ errorMessage && <Notice status="is-error" showDismiss={ false }>{ errorMessage }</Notice> }
							<Button onClick={ this.toggleDialog }>{ translate( 'Cancel' ) }</Button>
							<Button primary onClick={ this.submit }>{ translate( 'Fulfill' ) }</Button>
						</div>
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
