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
import debugFactory from 'debug';
const debug = debugFactory( 'allendav' );

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
import { navigate } from 'state/ui/actions';
import Notice from 'components/notice';
import ProgressBar from 'components/progress-bar';

class PaymentMethodStripeCompleteOAuthDialog extends Component {
	static propTypes = {
		oauthCode: PropTypes.string.isRequired,
		oauthState: PropTypes.string.isRequired,
		siteId: PropTypes.number.isRequired,
		siteSlug: PropTypes.string.isRequired,
	};

	constructor( props ) {
		super( props );
	}

	componentWillMount = () => {
		this.props.clearError();
	};

	componentDidMount = () => {
		const { oauthCode, oauthState, siteId, siteSlug } = this.props;
		const completeLink = ( '/store/settings/payments/:site?oauth_complete', { slug: siteSlug } );
		this.props.oauthConnect( siteId, oauthCode, oauthState, navigate( completeLink ) );
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
		this.props.clearError();
		// TODO - navigate away from this location with state and code
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

		debug( 'in complete dialog, props=', this.props );

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

function mapStateToProps( state, ownProps ) {
	const error = getError( state, ownProps.siteId );
	const isOAuthConnecting = getIsOAuthConnecting( state, ownProps.siteId );

	return {
		isOAuthConnecting,
		error,
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
