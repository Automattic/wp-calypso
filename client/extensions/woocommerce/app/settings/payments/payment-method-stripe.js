/**
 * External dependencies
 */
import config from 'config';
import React, { Component } from 'react';
import { isEmpty, isString, pick, some } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import APIKeysView from 'woocommerce/components/api-keys-view';
import AuthCaptureToggle from 'woocommerce/components/auth-capture-toggle';
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import PaymentMethodEditFormToggle from './payment-method-edit-form-toggle';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import StripeConnectAccount from './payment-method-stripe-connect-account';
import StripeConnectPrompt from './payment-method-stripe-connect-prompt';
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

	state = {
		createSelected: false,
		missingFieldsNotice: false,
		userRequestedKeyFlow: false,
		userRequestedConnectFlow: false,
	}

	static propTypes = {
		stripeConnectAccount: PropTypes.shape( {
			connectedUserID: PropTypes.string,
			displayName: PropTypes.string,
			email: PropTypes.string,
			firstName: PropTypes.string,
			isActivated: PropTypes.bool,
			lastName: PropTypes.string,
			logo: PropTypes.string,
		} ),
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
		site: PropTypes.shape( {
			domain: PropTypes.string.isRequired,
		} ),
	};

	////////////////////////////////////////////////////////////////////////////
	// Temporary - will be removed in subsequent PR
	static defaultProps = {
		stripeConnectAccount: {
			connectedUserID: '', // e.g. acct_14qyt6Alijdnw0EA
			displayName: '',
			email: '',
			firstName: '',
			isActivated: false,
			lastName: '',
			logo: '',
		}
	};

	////////////////////////////////////////////////////////////////////////////
	// Lifecycle sorcery

	constructor( props ) {
		super( props );
		this.state = {
			createSelected: true,
			hadKeysAtStart: this.hasKeys( props ),
			userRequestedKeyFlow: false,
			userRequestedConnectFlow: false,
		};
	}

	////////////////////////////////////////////////////////////////////////////
	// Misc helpers

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

	hasNonTrivialStringValue = ( prop ) => {
		if ( ! ( 'value' in prop ) ) {
			return false;
		}
		if ( ! isString( prop.value ) ) {
			return false;
		}
		return ( ! isEmpty( prop.value.trim() ) );
	}

	hasKeys = ( props ) => {
		if ( ! props ) {
			props = this.props;
		}

		const apiKeyList = [ 'publishable_key', 'secret_key', 'test_publishable_key', 'test_secret_key' ];
		if ( some( pick( this.props.method.settings, apiKeyList ), prop => this.hasNonTrivialStringValue( prop ) ) ) {
			return true;
		}

		return false;
	}

	////////////////////////////////////////////////////////////////////////////
	// Heading

	renderHeading = () => {
		const { stripeConnectAccount, translate } = this.props;
		const { connectedUserID } = stripeConnectAccount;

		// If we are not connected AND had no keys at mount display
		// Take credit card payments with Stripe
		if ( ! connectedUserID && ! this.state.hadKeysAtStart ) {
			return (
				<div className="payments__method-edit-header">
					{ translate( 'Take credit card payments with Stripe' ) }
				</div>
			);
		}

		// Otherwise, display Manage Stripe
		return (
			<div className="payments__method-edit-header">
				{ translate( 'Manage Stripe' ) }
			</div>
		);
	}

	////////////////////////////////////////////////////////////////////////////
	// Setup prompting

	onSelectCreate = () => {
		this.setState( { createSelected: true } );
	}

	onSelectConnect = () => {
		this.setState( { createSelected: false } );
	}

	possiblyRenderSetupPrompt = () => {
		const { stripeConnectAccount, translate } = this.props;
		const { connectedUserID } = stripeConnectAccount;

		// If we don't have the new connect UX enabled yet, keep the legacy prompt instead
		if ( ! config.isEnabled( 'woocommerce/extension-settings-stripe-connect-flows' ) ) {
			return (
				<Notice showDismiss={ false } text={ translate( 'To use Stripe you need to register an account' ) }>
					<NoticeAction href="https://dashboard.stripe.com/register">{ translate( 'Sign up' ) }</NoticeAction>
				</Notice>
			);
		}

		// Do we have any API keys? If so, do not display connect prompt
		// unless the user specifically asked for it
		if ( this.hasKeys() && ! this.state.userRequestedConnectFlow ) {
			return null;
		}

		// Do we have a Stripe Connect User ID already? If so, do not display connect prompt
		if ( connectedUserID ) {
			return null;
		}

		// Did the user ask for the key based flow? If so, do not display connect prompt
		if ( this.state.userRequestedKeyFlow ) {
			return null;
		}

		// Did we have keys when we started? If so, do not display the connect prompt
		// unless the user explicitly requested the connect flow
		if ( this.state.hadKeysAtStart && ! this.state.userRequestedConnectFlow ) {
			return null;
		}

		return (
			<StripeConnectPrompt
				isCreateSelected={ this.state.createSelected }
				onSelectCreate={ this.onSelectCreate }
				onSelectConnect={ this.onSelectConnect }
			/>
		);
	}

	////////////////////////////////////////////////////////////////////////////
	// Stripe Connect Account details (if any)

	possiblyRenderConnectAccount = () => {
		const { stripeConnectAccount } = this.props;

		// No account ID? Bail
		if ( ! stripeConnectAccount.connectedUserID ) {
			return null;
		}

		return (
			<StripeConnectAccount
				stripeConnectAccount={ stripeConnectAccount }
			/>
		);
	}

	////////////////////////////////////////////////////////////////////////////
	// Live vs Test Mode

	onSelectLive = () => {
		this.props.onEditField( 'testmode', 'no' );
	}

	onSelectTest = () => {
		this.props.onEditField( 'testmode', 'yes' );
	}

	possiblyRenderModePrompt = () => {
		const { method, stripeConnectAccount } = this.props;
		const { connectedUserID } = stripeConnectAccount;

		// Do we have a connected account? Don't bother showing this control
		if ( connectedUserID ) {
			return null;
		}

		// Did the user request connect flow? Don't bother showing this control
		if ( this.state.userRequestedConnectFlow ) {
			return null;
		}

		// No keys AND the user didn't request key flow? Don't show these fields
		if ( ! this.hasKeys() && ! this.state.userRequestedKeyFlow ) {
			return null;
		}

		return (
			<FormFieldset className="payments__method-edit-field-container">
				<TestLiveToggle
					isTestMode={ 'yes' === method.settings.testmode.value }
					onSelectLive={ this.onSelectLive }
					onSelectTest={ this.onSelectTest }
				/>
			</FormFieldset>
		);
	}

	////////////////////////////////////////////////////////////////////////////
	// Key Fields

	possiblyRenderKeyFields = () => {
		const { method, stripeConnectAccount, translate } = this.props;
		const { connectedUserID } = stripeConnectAccount;

		// Do we have a connected account? Don't bother showing keys
		if ( connectedUserID ) {
			return null;
		}

		// Did the user request connect flow? Don't bother showing this control
		if ( this.state.userRequestedConnectFlow ) {
			return null;
		}

		// No keys AND the user didn't request key flow? Don't show these fields
		if ( ! this.hasKeys() && ! this.state.userRequestedKeyFlow ) {
			return null;
		}

		let keys = [];

		if ( method.settings.testmode.value === 'no' ) {
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

	////////////////////////////////////////////////////////////////////////////
	// All the rest of the settings - auth/capture, descriptor, apple pay

	onSelectAuthOnly = () => {
		this.props.onEditField( 'capture', 'no' );
	}

	onSelectCapture = () => {
		this.props.onEditField( 'capture', 'yes' );
	}

	getStatementDescriptorPlaceholder = () => {
		const { site, translate } = this.props;
		const domain = site.domain.substr( 0, 22 ).trim().toUpperCase();
		return translate( 'e.g. %(domain)s', { args: { domain } } );
	}

	possiblyRenderMoreSettings = () => {
		const { method, stripeConnectAccount, translate } = this.props;
		const { isActivated, connectedUserID } = stripeConnectAccount;

		// Show these controls if
		// 1) we have a connected AND activated account
		// OR 2) if we don't have an account but we do have at least some keys
		// OR 3) if the user has requested key entry mode explicitly
		let okToShow = false;

		if ( isActivated && connectedUserID ) {
			okToShow = true;
		}

		if ( ! connectedUserID && this.hasKeys() ) {
			okToShow = true;
		}

		if ( this.state.userRequestedKeyFlow ) {
			okToShow = true;
		}

		// But, if the user has requested connect flow - don't show these fields
		if ( this.state.userRequestedConnectFlow ) {
			okToShow = false;
		}

		if ( ! okToShow ) {
			return null;
		}

		return (
			<div>
				<AuthCaptureToggle
					isAuthOnlyMode={ 'yes' === method.settings.capture.value }
					onSelectAuthOnly={ this.onSelectAuthOnly }
					onSelectCapture={ this.onSelectCapture }
				/>
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
			</div>
		);
	}

	////////////////////////////////////////////////////////////////////////////
	// Dialog action button methods, including the links that let the user force a flow

	onUserRequestsKeyFlow = () => {
		this.setState(
			{ userRequestedKeyFlow: true, userRequestedConnectFlow: false }
		);
	}

	onUserRequestsConnectFlow = () => {
		this.setState(
			{ userRequestedKeyFlow: false, userRequestedConnectFlow: true }
		);
	}

	onConnect = () => {
		// Not yet implemented
	}

	onDone = ( e ) => {
		if ( hasStripeValidCredentials( this.props.method ) ) {
			this.props.onDone( e );
		} else {
			this.setState( { missingFieldsNotice: true } );
		}
	}

	getButtons = () => {
		const { onCancel, stripeConnectAccount, translate } = this.props;
		const { connectedUserID } = stripeConnectAccount;

		const buttons = [];

		let showKeyFlowLink = false;
		let showConnectFlowLink = false;

		// If we don't have an account, we didn't have keys when we started, and
		// we don't have keys now, give the user a means to request key flow
		if ( ! connectedUserID && ! this.hasKeys() && ! this.state.hadKeysAtStart ) {
			showKeyFlowLink = true;
		}

		// If we have keys, OR are in key flow, give the user a means to request connect flow
		if ( this.hasKeys() || this.state.userRequestedKeyFlow ) {
			showConnectFlowLink = true;
		}

		// If we don't have keys now, but we did when we started, the user might be
		// interested in trying connect flow, so give the user a means to
		// switch to connect flow
		if ( ! this.hasKeys() && this.state.hadKeysAtStart ) {
			showConnectFlowLink = true;
		}

		// Sanity check - if we are already in key flow, don't show the key flow link
		if ( this.state.userRequestedKeyFlow ) {
			showKeyFlowLink = false;
		}

		// Sanity check - if we are already in connect flow, don't show the connect flow link
		if ( this.state.userRequestedConnectFlow ) {
			showConnectFlowLink = false;
		}

		// Sanity check - if we already are connected, don't show the connect flow link
		if ( connectedUserID ) {
			showConnectFlowLink = false;
		}

		// OK, make it so
		if ( showKeyFlowLink ) {
			buttons.push( {
				action: 'switch',
				label: <span>{ translate( 'I want to enter my own keys' ) }</span>,
				onClick: this.onUserRequestsKeyFlow,
				additionalClassNames: 'payments__method-stripe-force-flow is-borderless'
			} );
		} else if ( showConnectFlowLink ) {
			buttons.push( {
				action: 'switch',
				label: <span>{ translate( 'I want to use Stripe Connect instead' ) }</span>,
				onClick: this.onUserRequestsConnectFlow,
				additionalClassNames: 'payments__method-stripe-force-flow is-borderless'
			} );
		}

		// We always give the user a Cancel button
		buttons.push( { action: 'cancel', label: translate( 'Cancel' ), onClick: onCancel } );

		// Figure out if we should show a Connect button or a Done button
		let showConnectButton = false;

		// No account, no keys, not in key flow? Give them a Connect button
		if ( ! connectedUserID && ! this.hasKeys() && ! this.state.userRequestedKeyFlow ) {
			showConnectButton = true;
		}

		// Did the user request connect flow explicitly? Give them a Connect button
		if ( this.state.userRequestedConnectFlow ) {
			showConnectButton = true;
		}

		if ( showConnectButton ) {
			// TODO - enable this button in a subsequent PR
			buttons.push( { action: 'connect', disabled: true, label: translate( 'Connect' ), onClick: this.onConnect, isPrimary: true } );
		} else {
			buttons.push( { action: 'save', label: translate( 'Done' ), onClick: this.onDone, isPrimary: true } );
		}

		return buttons;
	}

	////////////////////////////////////////////////////////////////////////////
	// And render brings it all together

	render() {
		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.getButtons() }
				isVisible>
				{ this.renderHeading() }
				{ this.possiblyRenderSetupPrompt() }
				{ this.possiblyRenderConnectAccount() }
				{ this.possiblyRenderModePrompt() }
				{ this.possiblyRenderKeyFields() }
				{ this.possiblyRenderMoreSettings() }
			</Dialog>
		);
	}
}

export default localize( PaymentMethodStripe );
