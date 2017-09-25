/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import PaymentMethodEditFormToggle from '../payment-method-edit-form-toggle';
import StripeConnectAccount from './payment-method-stripe-connect-account';
import { getStripeSampleStatementDescriptor } from './payment-method-stripe-utils.js';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import AuthCaptureToggle from 'woocommerce/components/auth-capture-toggle';

class PaymentMethodStripeConnectedDialog extends Component {

	static propTypes = {
		domain: PropTypes.string.isRequired,
		method: PropTypes.shape( {
			settings: PropTypes.shape( {
				apple_pay: PropTypes.shape( { value: PropTypes.string.isRequired } ).isRequired,
				capture: PropTypes.shape( { value: PropTypes.string.isRequired } ).isRequired,
				secret_key: PropTypes.shape( { value: PropTypes.string.isRequired } ).isRequired,
				publishable_key: PropTypes.shape( { value: PropTypes.string.isRequired } ).isRequired,
				testmode: PropTypes.shape( { value: PropTypes.string.isRequired } ).isRequired,
				test_publishable_key: PropTypes.shape( { value: PropTypes.string.isRequired } ).isRequired,
				test_secret_key: PropTypes.shape( { value: PropTypes.string.isRequired } ).isRequired,
			} ),
		} ),
		onCancel: PropTypes.func.isRequired,
		onEditField: PropTypes.func.isRequired,
		onDone: PropTypes.func.isRequired,
		stripeConnectAccount: PropTypes.shape( {
			connectedUserID: PropTypes.string,
			displayName: PropTypes.string,
			email: PropTypes.string,
			firstName: PropTypes.string,
			isActivated: PropTypes.bool,
			lastName: PropTypes.string,
			logo: PropTypes.string,
		} ),
	};

	////////////////////////////////////////////////////////////////////////////
	// Live vs Test Mode and API Key Fields

	onSelectLive = () => {
		this.props.onEditField( { target: { name: 'testmode', value: 'no' } } );
	}

	onSelectTest = () => {
		this.props.onEditField( { target: { name: 'testmode', value: 'no' } } );
	}

	onSelectAuthOnly = () => {
		this.props.onEditField( { target: { name: 'capture', value: 'no' } } );
	}

	onSelectCapture = () => {
		this.props.onEditField( { target: { name: 'capture', value: 'yes' } } );
	}

	renderMoreSettings = () => {
		const { domain, method, onEditField, translate } = this.props;
		const sampleDescriptor = getStripeSampleStatementDescriptor( domain );

		return (
			<div>
				<AuthCaptureToggle
					isAuthOnlyMode={ 'no' === method.settings.capture.value }
					onSelectAuthOnly={ this.onSelectAuthOnly }
					onSelectCapture={ this.onSelectCapture }
				/>
				<FormFieldset>
					<FormLabel>
						{ translate( 'Descriptor' ) }
					</FormLabel>
					<FormTextInput
						name="statement_descriptor"
						onChange={ onEditField }
						value={ method.settings.statement_descriptor.value }
						placeholder={ translate( 'e.g. %(sampleDescriptor)s', { args: { sampleDescriptor } } ) } />
					<FormSettingExplanation>
						{ translate( 'Appears on your customer\'s credit card statement. 22 characters maximum' ) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormFieldset className="stripe__method-edit-field-container">
					<FormLabel>
						{ translate( 'Use Apple Pay' ) }
					</FormLabel>
					<PaymentMethodEditFormToggle
						checked={ method.settings.apple_pay.value === 'yes' ? true : false }
						name="apple_pay"
						onChange={ onEditField } />
					<span>
						{ translate(
							'By using Apple Pay you agree to Stripe and ' +
							'Apple\'s terms of service'
						) }
					</span>
				</FormFieldset>
			</div>
		);
	}

	getButtons = () => {
		const { onCancel, onDone, stripeConnectAccount, translate } = this.props;

		const buttons = [];

		if ( stripeConnectAccount.isActivated ) {
			buttons.push( { action: 'cancel', label: translate( 'Cancel' ), onClick: onCancel } );

			buttons.push( {
				action: 'save',
				label: translate( 'Done' ),
				onClick: onDone,
				isPrimary: true
			} );
		} else {
			buttons.push( {
				action: 'cancel',
				label: translate( 'Close' ),
				onClick: onCancel,
				isPrimary: true
			} );
		}

		return buttons;
	}

	render() {
		const { stripeConnectAccount, translate } = this.props;

		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.getButtons() }
				isVisible>
				<div className="stripe__method-edit-header">
					{ translate( 'Manage Stripe' ) }
				</div>
				<StripeConnectAccount
					stripeConnectAccount={ stripeConnectAccount }
				/>
			{ stripeConnectAccount.isActivated && this.renderMoreSettings() }
			</Dialog>
		);
	}
}

export default localize( PaymentMethodStripeConnectedDialog );
