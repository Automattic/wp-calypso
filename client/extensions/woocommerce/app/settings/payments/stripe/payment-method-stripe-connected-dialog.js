/**
 * External dependencies
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import AuthCaptureToggle from 'woocommerce/components/auth-capture-toggle';
import {
	clearCompletedNotification,
	deauthorizeAccount,
} from 'woocommerce/state/sites/settings/stripe-connect-account/actions';
import { Dialog } from '@automattic/components';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import {
	getIsDeauthorizing,
	getNotifyCompleted,
	getStripeConnectAccount,
} from 'woocommerce/state/sites/settings/stripe-connect-account/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getStripeSampleStatementDescriptor } from './payment-method-stripe-utils';
import Notice from 'calypso/components/notice';
import PaymentMethodEditFormToggle from '../payment-method-edit-form-toggle';
import StripeConnectAccount from './payment-method-stripe-connect-account';

class PaymentMethodStripeConnectedDialog extends Component {
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
	};

	onSelectTest = () => {
		this.props.onEditField( { target: { name: 'testmode', value: 'no' } } );
	};

	onSelectAuthOnly = () => {
		this.props.onEditField( { target: { name: 'capture', value: 'no' } } );
	};

	onSelectCapture = () => {
		this.props.onEditField( { target: { name: 'capture', value: 'yes' } } );
	};

	onDeauthorize = () => {
		const { siteId } = this.props;
		this.props.deauthorizeAccount( siteId );
	};

	onDismissNotice = () => {
		const { siteId } = this.props;
		this.props.clearCompletedNotification( siteId );
	};

	notifyConnectionCompleted = () => {
		const { stripeConnectAccount, translate } = this.props;
		const { email, isActivated } = stripeConnectAccount;

		let text;
		if ( isActivated ) {
			text = translate( 'Stripe is now connected! You can start accepting payments!' );
		} else {
			text = translate(
				'Stripe is now connected. An email from Stripe has been sent ' +
					'to %(email)s to activate the account.',
				{ args: { email } }
			);
		}

		return (
			<Notice
				onDismissClick={ this.onDismissNotice }
				showDismiss
				status="is-success"
				text={ text }
			/>
		);
	};

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
					<FormLabel>{ translate( 'Descriptor' ) }</FormLabel>
					<FormTextInput
						name="statement_descriptor"
						onChange={ onEditField }
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
						onChange={ onEditField }
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

	getButtons = () => {
		const { onCancel, onDone, isDeauthorizing, stripeConnectAccount, translate } = this.props;

		const buttons = [];

		const disabled = isDeauthorizing;

		if ( stripeConnectAccount.isActivated ) {
			buttons.push( {
				action: 'cancel',
				disabled,
				label: translate( 'Cancel' ),
				onClick: onCancel,
			} );

			buttons.push( {
				action: 'save',
				disabled,
				label: translate( 'Done' ),
				onClick: onDone,
				isPrimary: true,
			} );
		} else {
			buttons.push( {
				action: 'cancel',
				disabled,
				label: translate( 'Close' ),
				onClick: onCancel,
				isPrimary: true,
			} );
		}

		return buttons;
	};

	render() {
		const { isDeauthorizing, notifyCompleted, stripeConnectAccount, translate } = this.props;

		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.getButtons() }
				isVisible
			>
				<div className="stripe__method-edit-header">{ translate( 'Manage Stripe' ) }</div>
				{ notifyCompleted && this.notifyConnectionCompleted() }
				<StripeConnectAccount
					isDeauthorizing={ isDeauthorizing }
					onDeauthorize={ this.onDeauthorize }
					stripeConnectAccount={ stripeConnectAccount }
				/>
				{ stripeConnectAccount.isActivated && this.renderMoreSettings() }
			</Dialog>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site.ID || false;
	const isDeauthorizing = getIsDeauthorizing( state, siteId );
	const notifyCompleted = getNotifyCompleted( state, siteId );
	const stripeConnectAccount = getStripeConnectAccount( state, siteId );

	return {
		isDeauthorizing,
		notifyCompleted,
		siteId,
		stripeConnectAccount,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			clearCompletedNotification,
			deauthorizeAccount,
		},
		dispatch
	);
}

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( PaymentMethodStripeConnectedDialog )
);
