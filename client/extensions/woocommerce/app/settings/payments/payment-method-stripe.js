/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import config from 'config';
import { connect } from 'react-redux';
import { hasStripeKeyPairForMode } from './stripe/payment-method-stripe-utils.js';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { fetchAccountDetails } from 'woocommerce/state/sites/settings/stripe-connect-account/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	getIsRequesting,
	getStripeConnectAccount,
} from 'woocommerce/state/sites/settings/stripe-connect-account/selectors';
import PaymentMethodStripeConnectedDialog from './stripe/payment-method-stripe-connected-dialog';
import PaymentMethodStripeKeyBasedDialog from './stripe/payment-method-stripe-key-based-dialog';
import PaymentMethodStripePlaceholderDialog from './stripe/payment-method-stripe-placeholder-dialog';
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

	constructor( props ) {
		super( props );
		this.state = {
			hadKeysAtStart: hasStripeKeyPairForMode( props.method ),
			userRequestedConnectFlow: false,
			userRequestedKeyFlow: false,
		};
	}

	componentDidMount() {
		const { site } = this.props;
		if ( site && site.ID ) {
			this.props.fetchAccountDetails( site.ID );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { site } = this.props;
		const newSiteId = ( newProps.site && newProps.site.ID ) || null;
		const oldSiteId = ( site && site.ID ) || null;

		if ( oldSiteId !== newSiteId ) {
			this.props.fetchAccountDetails( newSiteId );
		}
	}

	////////////////////////////////////////////////////////////////////////////
	// Misc helpers

	onEditFieldHandler = e => {
		// Limit the statement descriptor field to 22 characters
		// since that is all Stripe will accept
		if ( e.target && 'statement_descriptor' === e.target.name ) {
			if ( 22 < e.target.value.length ) {
				return;
			}
		}
		// All others may continue
		this.props.onEditField( e.target.name, e.target.value );
	};

	////////////////////////////////////////////////////////////////////////////
	// Dialog action button methods, including the links that let the user force a flow

	onUserRequestsKeyFlow = () => {
		this.setState( { userRequestedKeyFlow: true, userRequestedConnectFlow: false } );
	};

	onUserRequestsConnectFlow = () => {
		this.setState( { userRequestedKeyFlow: false, userRequestedConnectFlow: true } );
	};

	////////////////////////////////////////////////////////////////////////////
	// And render brings it all together

	render() {
		const { isRequesting, method, onCancel, onDone, site, stripeConnectAccount } = this.props;
		const { connectedUserID } = stripeConnectAccount;

		const connectFlowsEnabled = config.isEnabled(
			'woocommerce/extension-settings-stripe-connect-flows'
		);

		let dialog = 'key-based';

		if ( connectFlowsEnabled ) {
			// No keys at start and user hasn't asked for key flow explicitly?
			// Give them the stripe connect setup flow
			if ( ! this.state.hadKeysAtStart && ! this.state.userRequestedKeyFlow ) {
				dialog = 'setup';
			}

			// If the user has requested connect flow, show that setup dialog
			// (and allow them to request key flow instead)
			if ( this.state.userRequestedConnectFlow ) {
				dialog = 'setup';
			}

			// If we have a Stripe Connect connected user, let them manage their connected account
			if ( connectedUserID ) {
				dialog = 'connected';
			}

			// Still waiting for a response? You get a placeholder
			if ( isRequesting ) {
				dialog = 'placeholder';
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
					domain={ site.domain }
					method={ method }
					onCancel={ onCancel }
					onDone={ onDone }
					onEditField={ this.onEditFieldHandler }
					stripeConnectAccount={ stripeConnectAccount }
				/>
			);
		} else if ( 'placeholder' === dialog ) {
			return <PaymentMethodStripePlaceholderDialog />;
		}

		// Key-based dialog by default
		return (
			<PaymentMethodStripeKeyBasedDialog
				domain={ site.domain }
				method={ method }
				onCancel={ onCancel }
				onDone={ onDone }
				onEditField={ this.onEditFieldHandler }
				onUserRequestsConnectFlow={
					connectFlowsEnabled ? this.onUserRequestsConnectFlow : undefined
				}
			/>
		);
	}
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const isRequesting = getIsRequesting( state, site.ID );
	const stripeConnectAccount = getStripeConnectAccount( state, site.ID );
	return {
		isRequesting,
		site,
		stripeConnectAccount,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			fetchAccountDetails,
		},
		dispatch
	);
}

export default localize( connect( mapStateToProps, mapDispatchToProps )( PaymentMethodStripe ) );
