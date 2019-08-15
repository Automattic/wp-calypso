/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { find, get } from 'lodash';
import { localize } from 'i18n-calypso';
const debug = debugFactory( 'calypso:me:security:social-login' );

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
import { login } from 'lib/paths';
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
		moment: PropTypes.func,
		path: PropTypes.string,
		translate: PropTypes.func.isRequired,
		userSettings: PropTypes.object,
	};

	state = {
		fetchingUser: false,
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component has mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component is unmounting.' );
	}

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
						'You’ll be able to log in faster by linking your WordPress.com account with your ' +
							'social networks. We’ll never post without your permission.'
					) }
				</CompactCard>
				{ this.renderGoogleConnection() }
				{ config.isEnabled( 'sign-in-with-apple' ) && this.renderAppleConnection() }
			</div>
		);
	}

	renderAppleActionButton( onClickAction = null ) {
		const { isUserConnectedToApple, isUpdatingSocialConnection, translate } = this.props;
		const buttonLabel = isUserConnectedToApple ? translate( 'Disconnect' ) : translate( 'Connect' );
		const disableButton = isUpdatingSocialConnection || this.state.fetchingUser;

		return (
			<FormButton
				className="social-login__button button"
				disabled={ disableButton }
				compact={ true }
				isPrimary={ ! isUserConnectedToApple }
				onClick={ onClickAction }
			>
				{ buttonLabel }
			</FormButton>
		);
	}

	renderGoogleActionButton( onClickAction = null ) {
		const { isUserConnectedToGoogle, isUpdatingSocialConnection, translate } = this.props;
		const buttonLabel = isUserConnectedToGoogle
			? translate( 'Disconnect' )
			: translate( 'Connect' );
		const disableButton = isUpdatingSocialConnection || this.state.fetchingUser;

		return (
			<FormButton
				className="social-login__button button"
				disabled={ disableButton }
				compact={ true }
				isPrimary={ ! isUserConnectedToGoogle }
				onClick={ onClickAction }
			>
				{ buttonLabel }
			</FormButton>
		);
	}

	renderAppleConnection() {
		const { isUserConnectedToApple, socialConnectionEmail } = this.props;

		// I have no idea what this should actually be.
		// const redirectUri = `https://${ typeof window !== 'undefined' &&
		// 	window.location.host }/me/security/social-login`;
		const redirectUri = `https://${ ( typeof window !== 'undefined' && window.location.host ) +
			login( { isNative: true, socialService: 'apple' } ) }`;

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
						{ isUserConnectedToApple ? (
							this.renderAppleActionButton( this.disconnectFromApple )
						) : (
							<AppleLoginButton
								clientId={ config( 'apple_oauth_client_id' ) }
								redirectUri={ redirectUri }
							>
								{ this.renderAppleActionButton() }
							</AppleLoginButton>
						) }
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
						{ isUserConnectedToGoogle ? (
							this.renderGoogleActionButton( this.disconnectFromGoogle )
						) : (
							<GoogleLoginButton
								clientId={ config( 'google_oauth_client_id' ) }
								responseHandler={ this.handleGoogleLoginResponse }
							>
								{ this.renderGoogleActionButton() }
							</GoogleLoginButton>
						) }
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
