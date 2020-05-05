/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import APIKeysView from 'woocommerce/components/api-keys-view';
import AuthCaptureToggle from 'woocommerce/components/auth-capture-toggle';
import { Dialog } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import {
	getStripeSampleStatementDescriptor,
	hasStripeKeyPairForMode,
} from './payment-method-stripe-utils';
import PaymentMethodEditFormToggle from '../payment-method-edit-form-toggle';
import TestLiveToggle from 'woocommerce/components/test-live-toggle';

class PaymentMethodStripeKeyBasedDialog extends Component {
	static propTypes = {
		domain: PropTypes.string.isRequired,
		method: PropTypes.shape( {
			settings: PropTypes.shape( {
				payment_request: PropTypes.shape( { value: PropTypes.string.isRequired } ).isRequired,
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
		onUserRequestsConnectFlow: PropTypes.func,
	};

	constructor( props ) {
		super( props );
		this.state = {
			hadKeysAtStart: hasStripeKeyPairForMode( props.method ),
			highlightEmptyRequiredFields: false,
		};
	}

	renderHeading = () => {
		const { translate } = this.props;

		// If we had no keys at mount
		if ( ! this.state.hadKeysAtStart ) {
			return (
				<div className="stripe__method-edit-header">
					{ translate( 'Accept credit card payments with Stripe' ) }
				</div>
			);
		}

		return <div className="stripe__method-edit-header">{ translate( 'Manage Stripe' ) }</div>;
	};

	onSelectLive = () => {
		this.props.onEditField( { target: { name: 'testmode', value: 'no' } } );
	};

	onSelectTest = () => {
		this.props.onEditField( { target: { name: 'testmode', value: 'yes' } } );
	};

	renderModePromptAndKeyFields = () => {
		const { method, translate } = this.props;
		const secretPlaceholder = translate( 'Enter your secret key from your Stripe.com account' );
		const publishablePlaceholder = translate(
			'Enter your publishable key from your Stripe.com account'
		);

		let keys = [];

		if ( method.settings.testmode.value === 'no' ) {
			keys = [
				{
					id: 'secret_key',
					label: translate( 'Live Secret Key' ),
					placeholder: secretPlaceholder,
					value: method.settings.secret_key.value,
				},
				{
					id: 'publishable_key',
					label: translate( 'Live Publishable Key' ),
					placeholder: publishablePlaceholder,
					value: method.settings.publishable_key.value,
				},
			];
		} else {
			keys = [
				{
					id: 'test_secret_key',
					label: translate( 'Test Secret Key' ),
					placeholder: secretPlaceholder,
					value: method.settings.test_secret_key.value,
				},
				{
					id: 'test_publishable_key',
					label: translate( 'Test Publishable Key' ),
					placeholder: publishablePlaceholder,
					value: method.settings.test_publishable_key.value,
				},
			];
		}

		return (
			<div>
				<FormFieldset className="stripe__method-edit-field-container">
					<TestLiveToggle
						isTestMode={ 'yes' === method.settings.testmode.value }
						onSelectLive={ this.onSelectLive }
						onSelectTest={ this.onSelectTest }
					/>
				</FormFieldset>
				<APIKeysView
					highlightEmptyRequiredFields={ this.state.highlightEmptyRequiredFields }
					keys={ keys }
					onEdit={ this.props.onEditField }
				/>
			</div>
		);
	};

	onSelectAuthOnly = () => {
		this.props.onEditField( { target: { name: 'capture', value: 'no' } } );
	};

	onSelectCapture = () => {
		this.props.onEditField( { target: { name: 'capture', value: 'yes' } } );
	};

	renderMoreSettings = () => {
		const { domain, method, translate } = this.props;
		const sampleDescriptor = getStripeSampleStatementDescriptor( domain );

		return (
			<div>
				<AuthCaptureToggle
					isAuthOnlyMode={ 'no' === method.settings.capture.value }
					onSelectAuthOnly={ this.onSelectAuthOnly }
					onSelectCapture={ this.onSelectCapture }
				/>
				<FormFieldset>
					<FormLabel>{ translate( 'Descriptor' ) }</FormLabel>
					<FormTextInput
						name="statement_descriptor"
						onChange={ this.props.onEditField }
						value={ method.settings.statement_descriptor.value }
						placeholder={ translate( 'e.g. %(sampleDescriptor)s', { args: { sampleDescriptor } } ) }
					/>
					<FormSettingExplanation>
						{ translate(
							"Appears on your customer's credit card statement. 22 characters maximum"
						) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormFieldset className="stripe__method-edit-field-container">
					<FormLabel>{ translate( 'Use Apple Pay & Chrome Payment Request API' ) }</FormLabel>
					<PaymentMethodEditFormToggle
						checked={
							method.settings.payment_request && method.settings.payment_request.value === 'yes'
								? true
								: false
						}
						name="payment_request"
						onChange={ this.props.onEditField }
					/>
					<span>
						{ translate(
							'By using Apple Pay you agree to Stripe and ' + "Apple's terms of service"
						) }
					</span>
					<FormSettingExplanation>
						{ translate( 'Enables Apple Pay and Chrome Payment Request buttons.' ) }
					</FormSettingExplanation>
				</FormFieldset>
			</div>
		);
	};

	onDone = ( e ) => {
		if ( hasStripeKeyPairForMode( this.props.method ) ) {
			this.props.onDone( e );
		} else {
			this.setState( { highlightEmptyRequiredFields: true } );
		}
	};

	getButtons = () => {
		const { method, onCancel, onUserRequestsConnectFlow, translate } = this.props;

		const buttons = [];

		if ( onUserRequestsConnectFlow ) {
			buttons.push( {
				action: 'switch',
				label: <span>{ translate( 'I want to use Stripe Connect instead' ) }</span>,
				onClick: onUserRequestsConnectFlow,
				additionalClassNames: 'payments__method-stripe-force-flow is-borderless',
			} );
		}

		buttons.push( { action: 'cancel', label: translate( 'Cancel' ), onClick: onCancel } );

		buttons.push( {
			action: 'save',
			disabled: ! hasStripeKeyPairForMode( method ),
			label: translate( 'Done' ),
			onClick: this.onDone,
			isPrimary: true,
		} );

		return buttons;
	};

	render() {
		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.getButtons() }
				isVisible
			>
				{ this.renderHeading() }
				{ this.renderModePromptAndKeyFields() }
				{ this.renderMoreSettings() }
			</Dialog>
		);
	}
}

export default localize( PaymentMethodStripeKeyBasedDialog );
