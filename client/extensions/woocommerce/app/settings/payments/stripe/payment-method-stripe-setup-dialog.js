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
import {
	areSettingsGeneralLoading,
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';
import {
	clearError,
	createAccount,
	oauthInit,
} from 'woocommerce/state/sites/settings/stripe-connect-account/actions';
import { Dialog } from '@automattic/components';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';
import {
	getError,
	getIsCreating,
	getIsOAuthInitializing,
	getOAuthURL,
} from 'woocommerce/state/sites/settings/stripe-connect-account/selectors';
import { getLink, getOrigin } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Notice from 'calypso/components/notice';
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

	UNSAFE_componentWillMount = () => {
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
		const { isCreating, isOAuthInitializing, oauthUrl, siteId, siteSlug } = this.props;
		if ( isCreating ) {
			return;
		}
		this.setState( { createSelected: false } );

		// See if we still need to initialize OAuth, and if so, do so
		if ( ! isOAuthInitializing && 0 === oauthUrl.length ) {
			const origin = getOrigin();
			const path = getLink( '/store/settings/payments/:site', { slug: siteSlug } );
			const returnUrl = `${ origin }${ path }`;
			this.props.oauthInit( siteId, returnUrl );
		}
	};

	onConnect = () => {
		const { country, email, oauthUrl, siteId } = this.props;

		if ( this.state.createSelected ) {
			this.props.createAccount( siteId, email, country );
		} else {
			window.location = oauthUrl;
		}
	};

	getButtons = () => {
		const {
			isCreating,
			isLoadingAddress,
			isOAuthInitializing,
			onCancel,
			onUserRequestsKeyFlow,
			translate,
		} = this.props;

		const buttons = [];
		const isBusy = isCreating || isLoadingAddress || isOAuthInitializing;

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
			disabled: isBusy,
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
					{ translate( 'Accept credit card payments with Stripe' ) }
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
	const siteSlug = site.slug || '';

	const error = getError( state, siteId );
	const isCreating = getIsCreating( state, siteId );
	const isOAuthInitializing = getIsOAuthInitializing( state, siteId );
	const oauthUrl = getOAuthURL( state, siteId );

	const isLoadingAddress = areSettingsGeneralLoading( state, siteId );
	const storeLocation = getStoreLocation( state, siteId );
	const country = isLoadingAddress ? '' : storeLocation.country;

	return {
		country,
		email,
		error,
		isCreating,
		isLoadingAddress,
		isOAuthInitializing,
		oauthUrl,
		siteId,
		siteSlug,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			clearError,
			createAccount,
			oauthInit,
		},
		dispatch
	);
}

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( PaymentMethodStripeSetupDialog )
);
