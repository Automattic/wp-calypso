/**
 * External dependencies
 *
 * @format
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import { createAccount } from 'woocommerce/state/sites/settings/stripe-connect-account/actions';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import {
	areSettingsGeneralLoaded,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import Dialog from 'components/dialog';
import { getIsCreating } from 'woocommerce/state/sites/settings/stripe-connect-account/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import StripeConnectPrompt from './payment-method-stripe-connect-prompt';
import QuerySettingsGeneral from 'woocommerce/components/query-settings-general';

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
	};

	onSelectConnect = () => {
		this.setState( { createSelected: false } );
	};

	onConnect = () => {
		const { address, email, site } = this.props;
		// TODO support OAuth (Connect) flow too
		this.props.createAccount( site.ID, email, address.country );
	};

	getButtons = () => {
		const {
			isCreating,
			onCancel,
			onUserRequestsKeyFlow,
			settingsGeneralLoaded,
			translate,
		} = this.props;
		const buttons = [];

		const isBusy = ! settingsGeneralLoaded || isCreating;

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
		const { site, translate } = this.props;

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
				<QuerySettingsGeneral siteId={ site && site.ID } />
			</Dialog>
		);
	}
}

/*
*/

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const address = getStoreLocation( state, site.ID );
	const email = getCurrentUserEmail( state );
	const isCreating = getIsCreating( state, site.ID );
	const settingsGeneralLoaded = areSettingsGeneralLoaded( state, site.ID );
	return {
		address,
		email,
		isCreating,
		settingsGeneralLoaded,
		site,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			createAccount,
		},
		dispatch
	);
}

export default connect( mapStateToProps, mapDispatchToProps )(
	localize( PaymentMethodStripeSetupDialog )
);
