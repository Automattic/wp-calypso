/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import APIKeysView from 'woocommerce/components/api-keys-view';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import PaymentMethodEditFormToggle from './payment-method-edit-form-toggle';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import TestLiveToggle from 'woocommerce/components/test-live-toggle';

export function hasStripeValidCredentials( method ) {
	const { settings } = method;
	const isLiveMode = method.settings.testmode.value !== 'yes';
	if ( isLiveMode ) {
		return settings.secret_key.value.trim() && settings.publishable_key.value.trim();
	}
	return settings.test_secret_key.value.trim() && settings.test_publishable_key.value.trim();
}

class PaymentMethodStripe extends Component {

	static propTypes = {
		method: PropTypes.shape( {
			settings: PropTypes.shape( {
				title: PropTypes.shape( {
					id: PropTypes.string.isRequired,
					label: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
					value: PropTypes.string.isRequired,
				} ),
			} ),
		} ),
		translate: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onEditField: PropTypes.func.isRequired,
		onDone: PropTypes.func.isRequired,
		site: PropTypes.shape( {
			title: PropTypes.string,
		} ),
	};

	state = {
		missingFieldsNotice: false,
	};

	onEditFieldHandler = ( e ) => {
		// Limit the statement descriptor field to 22 characters
		// since that is all Stripe will accept
		if ( e.target && 'statement_descriptor' === e.target.name ) {
			if ( 22 < e.target.value.length ) {
				return;
			}
		}
		// All others may continue
		this.props.onEditField( e.target.name, e.target.value );
	}

	onSelectLive = () => {
		this.props.onEditField( 'testmode', 'no' );
	}

	onSelectTest = () => {
		this.props.onEditField( 'testmode', 'yes' );
	}

	renderKeyFields = ( isLiveMode ) => {
		const { method, translate } = this.props;

		let keys = [];

		if ( isLiveMode ) {
			keys = [
				{
					id: 'secret_key',
					label: translate( 'Live Secret Key' ),
					placeholder: translate( 'Enter your secret key from your Stripe.com account' ),
					value: method.settings.secret_key.value,
				},
				{
					id: 'publishable_key',
					label: translate( 'Live Publishable Key' ),
					placeholder: translate( 'Enter your publishable key from your Stripe.com account' ),
					value: method.settings.publishable_key.value,
				}
			];
		} else {
			keys = [
				{
					id: 'test_secret_key',
					label: translate( 'Test Secret Key' ),
					placeholder: translate( 'Enter your secret key from your Stripe.com account' ),
					value: method.settings.test_secret_key.value,
				},
				{
					id: 'test_publishable_key',
					label: translate( 'Test Publishable Key' ),
					placeholder: translate( 'Enter your publishable key from your Stripe.com account' ),
					value: method.settings.test_publishable_key.value,
				}
			];
		}

		return (
			<APIKeysView
				highlightEmptyFields={ this.state.missingFieldsNotice }
				keys={ keys }
				onEdit={ this.onEditFieldHandler }
			/>
		);
	}

	onDone = ( e ) => {
		if ( hasStripeValidCredentials( this.props.method ) ) {
			this.props.onDone( e );
		} else {
			this.setState( { missingFieldsNotice: true } );
		}
	}

	buttons = [
		{ action: 'cancel', label: this.props.translate( 'Cancel' ), onClick: this.props.onCancel },
		{ action: 'save', label: this.props.translate( 'Enable Stripe' ), onClick: this.onDone, isPrimary: true },
	];

	getStatementDescriptorPlaceholder = () => {
		const { site, translate } = this.props;
		const domain = site.domain.substr( 0, 22 ).trim().toUpperCase();
		return translate( 'e.g. %(domain)s', { args: { domain } } );
	}

	render() {
		const { method, translate } = this.props;
		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.buttons }
				isVisible>
				<FormFieldset className="payments__method-edit-field-container">
					<Notice showDismiss={ false } text={ translate( 'To use Stripe you need to register an account' ) }>
						<NoticeAction href="https://dashboard.stripe.com/register">{ translate( 'Sign up' ) }</NoticeAction>
					</Notice>
					<TestLiveToggle
						isTestMode={ method.settings.testmode.value === 'yes' }
						onSelectLive={ this.onSelectLive }
						onSelectTest={ this.onSelectTest }
					/>
				</FormFieldset>
				{ method.settings.testmode.value === 'yes' && this.renderKeyFields( false ) }
				{ method.settings.testmode.value === 'no' && this.renderKeyFields( true ) }
				<FormFieldset className="payments__method-edit-field-container">
					<FormLegend>{ translate( 'Payment authorization' ) }</FormLegend>
					<FormLabel>
						<FormRadio
							name="capture"
							value="yes"
							checked={ 'yes' === method.settings.capture.value }
							onChange={ this.onEditFieldHandler } />
						<span>{ translate( 'Authorize and charge the customers credit card automatically' ) }</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							name="capture"
							value="no"
							checked={ 'no' === method.settings.capture.value }
							onChange={ this.onEditFieldHandler } />
						<span>{ translate( 'Authorize the customer\'s credit card but charge manually' ) }</span>
					</FormLabel>
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						{ translate( 'Descriptor' ) }
					</FormLabel>
					<FormTextInput
						name="statement_descriptor"
						onChange={ this.onEditFieldHandler }
						value={ method.settings.statement_descriptor.value }
						placeholder={ this.getStatementDescriptorPlaceholder() } />
					<FormSettingExplanation>
						{ translate( 'Appears on your customer\'s credit card statement. 22 characters maximum' ) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>
						{ translate( 'Use Apple Pay' ) }
					</FormLabel>
					<PaymentMethodEditFormToggle
						checked={ method.settings.apple_pay.value === 'yes' ? true : false }
						name="apple_pay"
						onChange={ this.onEditFieldHandler } />
					<span>
						{ translate(
							'By using Apple Pay you agree to Stripe and ' +
							'Apple\'s terms of service'
						) }
					</span>
				</FormFieldset>
			</Dialog>
		);
	}
}

export default localize( PaymentMethodStripe );
