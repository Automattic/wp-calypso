/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import ControlItem from 'components/segmented-control/item';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import PaymentMethodEditFormToggle from './payment-method-edit-form-toggle';
import SegmentedControl from 'components/segmented-control';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';

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

	onToggleTestMode = ( mode ) => {
		const testmode = mode === 'test' ? 'yes' : 'no';
		// return curried function
		return () => {
			this.props.onEditField( 'testmode', testmode );
		};
	}

	renderEditTextboxSecretKey = ( setting ) => {
		const { translate } = this.props;
		return (
			<FormTextInput
				name={ setting.id }
				onChange={ this.onEditFieldHandler }
				value={ setting.value }
				placeholder={ translate( 'Enter your secret key from your Stripe.com account' ) } />
		);
	}

	renderEditTextboxPublishableKey = ( setting ) => {
		const { translate } = this.props;
		return (
			<FormTextInput
				name={ setting.id }
				onChange={ this.onEditFieldHandler }
				value={ setting.value }
				placeholder={ translate( 'Enter your publishable key from your Stripe.com account' ) } />
		);
	}

	renderKeyFields = ( isLiveMode ) => {
		const { method, translate } = this.props;
		const secretLabel = isLiveMode ? translate( 'Live Secret Key' ) : translate( 'Test Secret Key' );
		const publishableLabel = isLiveMode ? translate( 'Live Publishable Key' ) : translate( 'Test Publishable Key' );

		return (
			<div>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>
						{ secretLabel }
					</FormLabel>
					{ this.renderEditTextboxSecretKey(
						isLiveMode ? method.settings.secret_key : method.settings.test_secret_key
					) }
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>
						{ publishableLabel }
					</FormLabel>
					{ this.renderEditTextboxPublishableKey(
						isLiveMode ? method.settings.publishable_key : method.settings.test_publishable_key
					) }
				</FormFieldset>
			</div>
		);
	}

	buttons = [
		{ action: 'cancel', label: this.props.translate( 'Cancel' ), onClick: this.props.onCancel },
		{ action: 'save', label: this.props.translate( 'Done' ), onClick: this.props.onDone, isPrimary: true },
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
					<FormLabel>{ translate( 'Payment Mode' ) }</FormLabel>
					<SegmentedControl
						primary
					>
						<ControlItem
							selected={ method.settings.testmode.value === 'yes' }
							onClick={ this.onToggleTestMode( 'test' ) }
						>
							{ translate( 'Test Mode' ) }
						</ControlItem>

						<ControlItem
							selected={ method.settings.testmode.value === 'no' }
							onClick={ this.onToggleTestMode( 'live' ) }
						>
							{ translate( 'Live Mode' ) }
						</ControlItem>
					</SegmentedControl>
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
						{ translate( 'Use ApplePay' ) }
					</FormLabel>
					<PaymentMethodEditFormToggle
						checked={ method.settings.apple_pay.value === 'yes' ? true : false }
						name="apple_pay"
						onChange={ this.onEditFieldHandler } />
					<span>
						{ translate(
							'By using ApplePay you agree to Stripe and ' +
							'Apple\'s terms of service'
						) }
					</span>
				</FormFieldset>
			</Dialog>
		);
	}
}

export default localize( PaymentMethodStripe );
