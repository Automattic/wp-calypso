/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import cookie from 'cookie';
import { get, includes } from 'lodash';

/**
 * Internal dependencies
 */
import Main from 'components/main';
import LoggedOutFormLinks from 'components/logged-out-form/links';
import { getAuthorizationRemoteQueryData } from 'state/jetpack-connect/selectors';
import { getCurrentUserId } from 'state/current-user/selectors';
import { recordTracksEvent, setTracksAnonymousUserId } from 'state/analytics/actions';
import EmptyContent from 'components/empty-content';
import MainWrapper from './main-wrapper';
import HelpButton from './help-button';
import JetpackConnectHappychatButton from './happychat-button';
import LoggedInForm from './auth-logged-in-form';
import LoggedOutForm from './auth-logged-out-form';

class JetpackConnectAuthorizeForm extends Component {
	static propTypes = {
		authorizationRemoteQueryData: PropTypes.shape( {
			_ui: PropTypes.string,
			_ut: PropTypes.string,
			client_id: PropTypes.string,
			from: PropTypes.string,
		} ).isRequired,
		isLoggedIn: PropTypes.bool.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		setTracksAnonymousUserId: PropTypes.func.isRequired,
	};

	componentWillMount() {
		// set anonymous ID for cross-system analytics
		const { authorizationRemoteQueryData } = this.props;
		if (
			authorizationRemoteQueryData &&
			authorizationRemoteQueryData._ui &&
			'anon' === authorizationRemoteQueryData._ut
		) {
			this.props.setTracksAnonymousUserId( authorizationRemoteQueryData._ui );
		}
		this.props.recordTracksEvent( 'calypso_jpc_authorize_form_view' );
	}

	isSSO() {
		const cookies = cookie.parse( document.cookie );
		const query = this.props.authorizationRemoteQueryData;
		return (
			query.from &&
			'sso' === query.from &&
			cookies.jetpack_sso_approved &&
			query.client_id &&
			query.client_id === cookies.jetpack_sso_approved
		);
	}

	isWoo() {
		const wooSlugs = [ 'woocommerce-setup-wizard', 'woocommerce-services' ];
		const jetpackConnectSource = get( this.props, 'authorizationRemoteQueryData.from' );

		return includes( wooSlugs, jetpackConnectSource );
	}

	handleClickHelp = () => {
		this.props.recordTracksEvent( 'calypso_jpc_help_link_click' );
	};

	renderNoQueryArgsError() {
		return (
			<Main className="jetpack-connect__main-error">
				<EmptyContent
					illustration="/calypso/images/illustrations/whoops.svg"
					title={ this.props.translate( 'Oops, this URL should not be accessed directly' ) }
					action={ this.props.translate( 'Get back to Jetpack Connect screen' ) }
					actionURL="/jetpack/connect"
				/>
				<LoggedOutFormLinks>
					<JetpackConnectHappychatButton eventName="calypso_jpc_noqueryarguments_chat_initiated">
						<HelpButton onClick={ this.handleClickHelp } />
					</JetpackConnectHappychatButton>
				</LoggedOutFormLinks>
			</Main>
		);
	}

	renderForm() {
		return this.props.isLoggedIn ? (
			<LoggedInForm isSSO={ this.isSSO() } isWoo={ this.isWoo() } />
		) : (
			<LoggedOutForm local={ this.props.locale } path={ this.props.path } />
		);
	}

	render() {
		const { authorizationRemoteQueryData } = this.props;

		if ( typeof authorizationRemoteQueryData === 'undefined' ) {
			return this.renderNoQueryArgsError();
		}

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
		authorizationRemoteQueryData: getAuthorizationRemoteQueryData( state ),
		isLoggedIn: !! getCurrentUserId( state ),
	} ),
	{
		recordTracksEvent,
		setTracksAnonymousUserId,
	}
)( localize( JetpackConnectAuthorizeForm ) );
