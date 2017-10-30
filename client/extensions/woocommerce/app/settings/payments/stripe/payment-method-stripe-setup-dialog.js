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
import {
	areSettingsGeneralLoading,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import {
	clearError,
	createAccount,
} from 'woocommerce/state/sites/settings/stripe-connect-account/actions';
import Dialog from 'components/dialog';
import { getCurrentUserEmail } from 'state/current-user/selectors';
import {
	getError,
	getIsCreating,
} from 'woocommerce/state/sites/settings/stripe-connect-account/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Notice from 'components/notice';
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
			createAllowed: true,
			createSelected: true,
		};
	}

	componentWillMount = () => {
		this.props.clearError();
	};

	onSelectCreate = () => {
		const { isCreating } = this.props;
		if ( isCreating ) {
			return;
		}
		this.setState( { createSelected: true } );
	};

	onSelectConnect = () => {
		const { isCreating } = this.props;
		if ( isCreating ) {
			return;
		}
		this.setState( { createSelected: false } );
	};

	onConnect = () => {
		const { country, email, siteId } = this.props;
		this.props.createAccount( siteId, email, country );
	};

	getButtons = () => {
		const { isCreating, isLoadingAddress, onCancel, onUserRequestsKeyFlow, translate } = this.props;
		const { createAllowed, createSelected } = this.state;

		const buttons = [];
		const isBusy = isCreating || isLoadingAddress;

		// connect/OAuth is coming in next PR, so enable the connect button for create only for now
		const connectButtonDisabled =
			isBusy || ! createSelected || ( createSelected && ! createAllowed );

		// Allow them to switch to key based flow if they want
		buttons.push( {
			action: 'switch',
			additionalClassNames: 'payments__method-stripe-force-flow is-borderless',
			label: <span>{ translate( 'I want to enter my own keys' ) }</span>,
			onClick: onUserRequestsKeyFlow,
		} );

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
			disabled: connectButtonDisabled,
			isPrimary: true,
			label: translate( 'Connect' ),
			onClick: this.onConnect,
		} );

		return buttons;
	};

	possiblyRenderNotice = () => {
		const { error } = this.props;
		if ( 0 === error.length ) {
			return null;
		}
		return <Notice showDismiss={ false } status="is-error" text={ error } />;
	};

	render = () => {
		const { siteId, translate } = this.props;

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
				{ this.possiblyRenderNotice() }
				<QuerySettingsGeneral siteId={ siteId } />
			</Dialog>
		);
	};
}

function mapStateToProps( state ) {
	const email = getCurrentUserEmail( state );
	const site = getSelectedSiteWithFallback( state );
	const siteId = site.ID || false;

	const error = getError( state, siteId );
	const isCreating = getIsCreating( state, siteId );

	const isLoadingAddress = areSettingsGeneralLoading( state, siteId );
	const storeLocation = getStoreLocation( state, siteId );
	const country = isLoadingAddress ? '' : storeLocation.country;

	return {
		country,
		email,
		error,
		isCreating,
		isLoadingAddress,
		siteId,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			clearError,
			createAccount,
		},
		dispatch
	);
}

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( PaymentMethodStripeSetupDialog )
);
