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
	clearError,
	oauthConnect,
} from 'woocommerce/state/sites/settings/stripe-connect-account/actions';
import Dialog from 'components/dialog';
import {
	getError,
	getIsOAuthConnecting,
} from 'woocommerce/state/sites/settings/stripe-connect-account/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import Notice from 'components/notice';
import page from 'page';
import ProgressBar from 'components/progress-bar';

class PaymentMethodStripeCompleteOAuthDialog extends Component {
	static propTypes = {
		oauthCode: PropTypes.string.isRequired,
		oauthState: PropTypes.string.isRequired,
		onCancel: PropTypes.func.isRequired,
	};

	componentWillMount = () => {
		this.props.clearError();
	};

	componentDidMount = () => {
		const { oauthCode, oauthState, siteId } = this.props;
		this.props.oauthConnect( siteId, oauthCode, oauthState );
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
		const { site } = this.props;
		this.props.clearError();

		// Important - when the user closes the dialog (which should only happen
		// in case of error), let's clear the query params by calling page
		// with the payment settings path
		const paymentsSettings = getLink( '/store/settings/payments/:site', site );
		page( paymentsSettings );

		// Let's make sure state reflects that the dialog is closed
		this.props.onCancel();
	};

	getButtons = () => {
		const { isOAuthConnecting, translate } = this.props;

		return [
			{
				action: 'cancel',
				disabled: isOAuthConnecting,
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

	return {
		error,
		isOAuthConnecting,
		site,
		siteId,
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
