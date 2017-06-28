/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component, PropTypes } from 'react';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormInputCheckbox from 'components/forms/form-checkbox';
import FormTextInput from 'components/forms/form-text-input';
import Notice from 'components/notice';

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

	submit = () => {
		this.setState( {
			errorMessage: 'Testing, not saved yet.',
		} );
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
					<Button primary onClick={ this.toggleDialog }>{ translate( 'Print label' ) }</Button>
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
							<FormInputCheckbox checked disabled />
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

export default localize( OrderFulfillment );
