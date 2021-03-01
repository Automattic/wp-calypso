/**
 * External dependencies
 */

import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { get, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import {
	clearError,
	oauthConnect,
} from 'woocommerce/state/sites/settings/stripe-connect-account/actions';
import { Dialog, ProgressBar } from '@automattic/components';
import {
	getError,
	getIsOAuthConnecting,
	getIsRequesting,
	getStripeConnectAccount,
} from 'woocommerce/state/sites/settings/stripe-connect-account/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Notice from 'calypso/components/notice';

class PaymentMethodStripeCompleteOAuthDialog extends Component {
	static propTypes = {
		oauthCode: PropTypes.string.isRequired,
		oauthState: PropTypes.string.isRequired,
		onCancel: PropTypes.func.isRequired,
	};

	UNSAFE_componentWillMount = () => {
		this.props.clearError();
	};

	componentDidMount = () => {
		const { oauthCode, oauthState, siteId, stripeConnectAccount } = this.props;

		// Kick off the last step of the OAuth flow, but only if we don't
		// have a connected user ID (to prevent re-entrancy)
		const connectedUserID = get( stripeConnectAccount, [ 'connectedUserID' ], '' );
		if ( isEmpty( connectedUserID ) ) {
			this.props.oauthConnect( siteId, oauthCode, oauthState );
		}
	};

	UNSAFE_componentWillReceiveProps = ( { stripeConnectAccount } ) => {
		// Did we receive a connected user ID? Connect must have finished, so
		// let's close this dialog
		const connectedUserID = get( stripeConnectAccount, [ 'connectedUserID' ], '' );
		if ( ! isEmpty( connectedUserID ) ) {
			this.onClose();
		}
	};

	possiblyRenderProgress = () => {
		const { error } = this.props;
		if ( 0 === error.length ) {
			return <ProgressBar value={ 100 } isPulsing />;
		}
		return null;
	};

	possiblyRenderNotice = () => {
		const { error } = this.props;
		if ( 0 === error.length ) {
			return null;
		}
		return <Notice showDismiss={ false } status="is-error" text={ error } />;
	};

	onClose = () => {
		const { error, site } = this.props;
		const oauthCompleted = isEmpty( error );
		this.props.clearError();

		// Important - when the user closes the dialog (which should only happen
		// in case of error), let's clear the query params by calling page
		// with the payment settings path
		const paymentsSettingsLink = getLink( '/store/settings/payments/:site', site );
		const paymentsSettingsQuery = oauthCompleted ? '?oauth_complete=1' : '';
		page( paymentsSettingsLink + paymentsSettingsQuery );

		// Lastly, in the case of an error, let's make sure state reflects that the dialog is closed
		if ( ! oauthCompleted ) {
			this.props.onCancel();
		}
	};

	getButtons = () => {
		const { isOAuthConnecting, isRequesting, translate } = this.props;

		if ( isOAuthConnecting || isRequesting ) {
			return [];
		}

		return [
			{
				action: 'cancel',
				label: translate( 'Close' ),
				onClick: this.onClose,
			},
		];
	};

	render = () => {
		const { translate } = this.props;

		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.getButtons() }
				isVisible
			>
				<div className="stripe__method-edit-header">
					{ translate( 'Completing Your Connection to Stripe' ) }
				</div>
				{ this.possiblyRenderProgress() }
				{ this.possiblyRenderNotice() }
			</Dialog>
		);
	};
}

function mapStateToProps( state ) {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site.ID || false;
	const error = getError( state, siteId );
	const isOAuthConnecting = getIsOAuthConnecting( state, siteId );
	const isRequesting = getIsRequesting( state, siteId );
	const stripeConnectAccount = getStripeConnectAccount( state, siteId );

	return {
		error,
		isOAuthConnecting,
		isRequesting,
		site,
		siteId,
		stripeConnectAccount,
	};
}

function mapDispatchToProps( dispatch ) {
	return bindActionCreators(
		{
			clearError,
			oauthConnect,
		},
		dispatch
	);
}

export default localize(
	connect( mapStateToProps, mapDispatchToProps )( PaymentMethodStripeCompleteOAuthDialog )
);
