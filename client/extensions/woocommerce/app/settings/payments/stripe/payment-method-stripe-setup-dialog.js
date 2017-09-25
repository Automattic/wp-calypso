/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import StripeConnectPrompt from './payment-method-stripe-connect-prompt';
import Dialog from 'components/dialog';

class PaymentMethodStripeSetupDialog extends Component {

	static propTypes = {
		onCancel: PropTypes.func.isRequired,
		onUserRequestsKeyFlow: PropTypes.func.isRequired,
	};

	constructor( props ) {
		super( props );
		this.state = {
			createSelected: true,
		};
	}

	onSelectCreate = () => {
		this.setState( { createSelected: true } );
	}

	onSelectConnect = () => {
		this.setState( { createSelected: false } );
	}

	onConnect = () => {
		// Not yet implemented
	}

	getButtons = () => {
		const { onCancel, onUserRequestsKeyFlow, translate } = this.props;
		const buttons = [];

		// Allow them to switch to key based flow if they want
		buttons.push( {
			action: 'switch',
			additionalClassNames: 'payments__method-stripe-force-flow is-borderless',
			label: <span>{ translate( 'I want to enter my own keys' ) }</span>,
			onClick: onUserRequestsKeyFlow,
		} );

		// Always give the user a Cancel button
		buttons.push( { action: 'cancel', label: translate( 'Cancel' ), onClick: onCancel } );

		// And then the connect button itself
		buttons.push( {
			action: 'connect',
			disabled: true, // TODO: will be enabled in a subsequent PR
			isPrimary: true,
			label: translate( 'Connect' ),
			onClick: this.onConnect,
		} );

		return buttons;
	}

	render() {
		const { translate } = this.props;

		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.getButtons() }
				isVisible>
				<div className="stripe__method-edit-header">
					{ translate( 'Take credit card payments with Stripe' ) }
				</div>
				<StripeConnectPrompt
					isCreateSelected={ this.state.createSelected }
					onSelectCreate={ this.onSelectCreate }
					onSelectConnect={ this.onSelectConnect }
				/>
			</Dialog>
		);
	}
}

export default localize( PaymentMethodStripeSetupDialog );
