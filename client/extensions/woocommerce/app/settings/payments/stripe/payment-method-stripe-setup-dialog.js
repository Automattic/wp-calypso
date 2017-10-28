/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import StripeConnectPrompt from './payment-method-stripe-connect-prompt';

class PaymentMethodStripeSetupDialog extends Component {
	static propTypes = {
		isBusy: PropTypes.bool.isRequired,
		onCancel: PropTypes.func.isRequired,
		onConnect: PropTypes.func.isRequired,
		onCreate: PropTypes.func.isRequired,
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
	};

	onSelectConnect = () => {
		this.setState( { createSelected: false } );
	};

	onConnect = () => {
		if ( this.state.createSelected ) {
			this.props.onCreate();
		} else {
			this.props.onConnect();
		}
	};

	getButtons = () => {
		const { isBusy, onCancel, onUserRequestsKeyFlow, translate } = this.props;
		const buttons = [];

		if ( ! isBusy ) {
			// Allow them to switch to key based flow if they want
			buttons.push( {
				action: 'switch',
				additionalClassNames: 'payments__method-stripe-force-flow is-borderless',
				label: <span>{ translate( 'I want to enter my own keys' ) }</span>,
				onClick: onUserRequestsKeyFlow,
			} );
		}

		// Always give the user a Cancel button
		buttons.push( {
			action: 'cancel',
			disabled: isBusy,
			label: translate( 'Cancel' ),
			onClick: onCancel,
		} );

		// And then the connect button itself
		buttons.push( {
			action: 'connect',
			disabled: isBusy || ! this.state.createSelected, // TODO account connection (OAuth) comes in the next PR
			isPrimary: true,
			label: translate( 'Connect' ),
			onClick: this.onConnect,
		} );

		return buttons;
	};

	render() {
		const { translate } = this.props;

		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.getButtons() }
				isVisible
			>
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
