/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getCurrentUserId } from 'state/current-user/selectors';
import { recordTracksEvent, setTracksAnonymousUserId } from 'state/analytics/actions';
import MainWrapper from './main-wrapper';
import LoggedInForm from './auth-logged-in-form';
import LoggedOutForm from './auth-logged-out-form';

class JetpackConnectAuthorizeForm extends Component {
	static propTypes = {
		authTracksUi: PropTypes.string,
		authTracksUt: PropTypes.string,

		// Connected props
		isLoggedIn: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		setTracksAnonymousUserId: PropTypes.func.isRequired,
	};

	componentWillMount() {
		// set anonymous ID for cross-system analytics
		const { authTracksUi, authTracksUt } = this.props;
		if ( 'anon' === authTracksUt && authTracksUi ) {
			this.props.setTracksAnonymousUserId( authTracksUi );
		}
		this.props.recordTracksEvent( 'calypso_jpc_authorize_form_view' );
	}

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	renderForm() {
		return this.props.isLoggedIn ? (
			<LoggedInForm
				authAlreadyAuthorized={ this.props.authAlreadyAuthorized }
				authBlogname={ this.props.authBlogname }
				authClientId={ this.props.authClientId }
				authFrom={ this.props.authFrom }
				authHomeUrl={ this.props.authHomeUrl }
				authJpVersion={ this.props.authJpVersion }
				authNewUserStartedConnection={ this.props.authNewUserStartedConnection }
				authNonce={ this.props.authNonce }
				authPartnerId={ this.props.authPartnerId }
				authRedirectAfterAuth={ this.props.authRedirectAfterAuth }
				authRedirectUri={ this.props.authRedirectUri }
				authScope={ this.props.authScope }
				authSecret={ this.props.authSecret }
				authSite={ this.props.authSite }
				authSiteIcon={ this.props.authSiteIcon }
				authSiteUrl={ this.props.authSiteUrl }
				authState={ this.props.authState }
			/>
		) : (
			<LoggedOutForm
				local={ this.props.locale }
				path={ this.props.path }
				authUserEmail={ this.props.authUserEmail }
			/>
		);
	}

	render() {
		return (
			<MainWrapper>
				<div className="jetpack-connect__authorize-form">{ this.renderForm() }</div>
			</MainWrapper>
		);
	}
}

export { JetpackConnectAuthorizeForm as JetpackConnectAuthorizeFormTestComponent };

export default connect(
	state => ( {
		isLoggedIn: !! getCurrentUserId( state ),
	} ),
	{
		recordTracksEvent,
		setTracksAnonymousUserId,
	}
)( localize( JetpackConnectAuthorizeForm ) );
