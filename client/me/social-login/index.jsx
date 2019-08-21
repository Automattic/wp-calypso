/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { find, get } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AppleIcon from 'components/social-icons/apple';
import AppleLoginButton from 'components/social-buttons/apple';
import CompactCard from 'components/card/compact';
import config from 'config';
import { connectSocialUser, disconnectSocialUser } from 'state/login/actions';
import DocumentHead from 'components/data/document-head';
import FormButton from 'components/forms/form-button';
import { getCurrentUser } from 'state/current-user/selectors';
import GoogleIcon from 'components/social-icons/google';
import GoogleLoginButton from 'components/social-buttons/google';
import { isRequesting, getRequestError } from 'state/login/selectors';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import Notice from 'components/notice';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import ReauthRequired from 'me/reauth-required';
import SecuritySectionNav from 'me/security-section-nav';
import twoStepAuthorization from 'lib/two-step-authorization';
import userFactory from 'lib/user';

/**
 * Style dependencies
 */
import './style.scss';

const user = userFactory();

class SocialLogin extends Component {
	static displayName = 'SocialLogin';

	static propTypes = {
		path: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	state = {
		fetchingUser: false,
	};

	refreshUser() {
		user.fetch();

		this.setState( { fetchingUser: true } );

		user.once( 'change', () => this.setState( { fetchingUser: false } ) );
	}

	disconnectFromApple = () => {
		this.props.disconnectSocialUser( 'apple' ).then( () => this.refreshUser() );
	};

	disconnectFromGoogle = () => {
		this.props.disconnectSocialUser( 'google' ).then( () => this.refreshUser() );
	};

	handleGoogleLoginResponse = response => {
		if ( ! response.Zi || ! response.Zi.access_token || ! response.Zi.id_token ) {
			return;
		}

		const socialInfo = {
			service: 'google',
			access_token: response.Zi.access_token,
			id_token: response.Zi.id_token,
		};

		return this.props.connectSocialUser( socialInfo ).then( () => this.refreshUser() );
	};

	handleAppleLoginResponse = response => {
		// just bail on errors for now
		if ( ! response.id_token ) {
			return;
		}

		const socialInfo = {
			service: 'apple',
			id_token: response.id_token,
		};

		return this.props.connectSocialUser( socialInfo ).then( () => this.refreshUser() );
	};

	renderContent() {
		const { translate, errorUpdatingSocialConnection } = this.props;

		return (
			<div>
				{ errorUpdatingSocialConnection && (
					<Notice status={ 'is-error' } showDismiss={ false }>
						{ errorUpdatingSocialConnection.message }
					</Notice>
				) }

				<CompactCard>
					{ translate(
						'You’ll be able to log in faster by linking your WordPress.com account with the following ' +
							'third-party services. We’ll never post without your permission.'
					) }
				</CompactCard>

				{ this.renderGoogleConnection() }

				{ config.isEnabled( 'sign-in-with-apple' ) && this.renderAppleConnection() }
			</div>
		);
	}

	renderActionButton( { service, isConnected, onConnect, onDisconnect } ) {
		const { isUpdatingSocialConnection, translate } = this.props;
		const buttonLabel = isConnected ? translate( 'Disconnect' ) : translate( 'Connect' );
		const disableButton = isUpdatingSocialConnection || this.state.fetchingUser;

		const actionButton = (
			<FormButton
				className="social-login__button button"
				disabled={ disableButton }
				compact={ true }
				isPrimary={ ! isConnected }
				onClick={ isConnected && onDisconnect }
			>
				{ buttonLabel }
			</FormButton>
		);

		if ( isConnected ) {
			return actionButton;
		}

		if ( service === 'google' ) {
			return (
				<GoogleLoginButton
					clientId={ config( 'google_oauth_client_id' ) }
					responseHandler={ onConnect }
				>
					{ actionButton }
				</GoogleLoginButton>
			);
		}

		if ( service === 'apple' ) {
			return <AppleLoginButton responseHandler={ onConnect }>{ actionButton }</AppleLoginButton>;
		}

		return null;
	}

	renderAppleConnection() {
		const { isUserConnectedToApple, socialConnectionEmail } = this.props;

		return (
			<CompactCard>
				<div className="social-login__header">
					<div className="social-login__header-info">
						<div className="social-login__header-icon">
							<AppleIcon width="30" height="30" />
						</div>
						<h3>Apple</h3>
						{ socialConnectionEmail && <p>{ ' - ' + socialConnectionEmail }</p> }
					</div>

					<div className="social-login__header-action">
						{ this.renderActionButton( {
							service: 'apple',
							isConnected: isUserConnectedToApple,
							onConnect: this.handleAppleLoginResponse,
							onDisconnect: this.disconnectFromApple,
						} ) }
					</div>
				</div>
			</CompactCard>
		);
	}

	renderGoogleConnection() {
		const { isUserConnectedToGoogle, socialConnectionEmail } = this.props;

		return (
			<CompactCard>
				<div className="social-login__header">
					<div className="social-login__header-info">
						<div className="social-login__header-icon">
							<GoogleIcon width="30" height="30" />
						</div>
						<h3>Google</h3>
						{ socialConnectionEmail && <p>{ ' - ' + socialConnectionEmail }</p> }
					</div>

					<div className="social-login__header-action">
						{ this.renderActionButton( {
							service: 'google',
							isConnected: isUserConnectedToGoogle,
							onConnect: this.handleGoogleLoginResponse,
							onDisconnect: this.disconnectFromGoogle,
						} ) }
					</div>
				</div>
			</CompactCard>
		);
	}

	render() {
		const title = this.props.translate( 'Social Login' );

		return (
			<Main className="social-login">
				<PageViewTracker path="/me/security/social-login" title="Me > Social Login" />
				<DocumentHead title={ title } />
				<MeSidebarNavigation />

				<SecuritySectionNav path={ this.props.path } />

				<ReauthRequired twoStepAuthorization={ twoStepAuthorization } />

				{ this.renderContent() }
			</Main>
		);
	}
}

export default connect(
	state => {
		const currentUser = getCurrentUser( state );
		const connections = currentUser.social_login_connections || [];
		const appleConnection = find( connections, { service: 'apple' } );
		const googleConnection = find( connections, { service: 'google' } );
		return {
			socialConnectionEmail: get( googleConnection, 'service_user_email', '' ),
			isUserConnectedToApple: appleConnection,
			isUserConnectedToGoogle: googleConnection,
			isUpdatingSocialConnection: isRequesting( state ),
			errorUpdatingSocialConnection: getRequestError( state ),
		};
	},
	{
		connectSocialUser,
		disconnectSocialUser,
	}
)( localize( SocialLogin ) );
