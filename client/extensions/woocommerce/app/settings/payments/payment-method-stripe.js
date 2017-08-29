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
import { hasStripeValidCredentials } from './stripe/payment-method-stripe-utils.js';
import PaymentMethodStripeConnectedDialog from './stripe/payment-method-stripe-connected-dialog';
import PaymentMethodStripeKeyBasedDialog from './stripe/payment-method-stripe-key-based-dialog';
import PaymentMethodStripeSetupDialog from './stripe/payment-method-stripe-setup-dialog';

class PaymentMethodStripe extends Component {
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
			highlightEmptyRequiredFields: false,
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

	onDone = ( e ) => {
		if ( hasStripeValidCredentials( this.props.method ) ) {
			this.props.onDone( e );
		} else {
			this.setState( { missingFieldsNotice: true } );
		}
	}

	////////////////////////////////////////////////////////////////////////////
	// And render brings it all together

	render() {
		const { method, onCancel, onDone, site, stripeConnectAccount } = this.props;
		const { connectedUserID } = stripeConnectAccount;

		const connectFlowsEnabled = config.isEnabled( 'woocommerce/extension-settings-stripe-connect-flows' );

		let dialog = 'key-based';

		if ( connectFlowsEnabled ) {
			// If the user has requested connect flow, show that setup dialog
			// (and allow them to request key flow instead)
			if ( this.state.userRequestedConnectFlow ) {
				dialog = 'setup';
			}

			// If we have a Stripe Connect connected user, let them manage their connected account
			if ( connectedUserID ) {
				dialog = 'connected';
			}
		}

		// Now, render the appropriate dialog
		if ( 'setup' === dialog ) {
			return (
				<PaymentMethodStripeSetupDialog
					onCancel={ onCancel }
					onUserRequestsKeyFlow={ this.onUserRequestsKeyFlow }
				/>
			);
		} else if ( 'connected' === dialog ) {
			return (
				<PaymentMethodStripeConnectedDialog
					method={ method }
					onCancel={ onCancel }
					onDone={ onDone }
					onEditField={ this.onEditFieldHandler }
					site={ site }
					stripeConnectAccount={ stripeConnectAccount }
				/>
			);
		}

		// Key-based dialog by default
		return (
			<PaymentMethodStripeKeyBasedDialog
				highlightEmptyRequiredFields={ this.state.highlightEmptyRequiredFields }
				method={ method }
				onCancel={ onCancel }
				onDone={ onDone }
				onEditField={ this.onEditFieldHandler }
				onUserRequestsConnectFlow={ connectFlowsEnabled ? this.onUserRequestsConnectFlow : undefined }
				site={ site }
			/>
		);
	}
}

export default localize( PaymentMethodStripe );
