/**
 * External dependencies
 */
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import DocumentHead from 'components/data/document-head';
import FormButton from 'components/forms/form-button';
import Main from 'components/main';
import Notice from 'components/notice';
import GoogleLoginButton from 'components/social-buttons/google';
import GoogleIcon from 'components/social-icons/google';
import config from 'config';
import twoStepAuthorization from 'lib/two-step-authorization';
import userFactory from 'lib/user';
import ReauthRequired from 'me/reauth-required';
import SecuritySectionNav from 'me/security-section-nav';
import MeSidebarNavigation from 'me/sidebar-navigation';
import { getCurrentUser } from 'state/current-user/selectors';
import { connectSocialUser, disconnectSocialUser } from 'state/login/actions';
import { isRequesting, getRequestError } from 'state/login/selectors';
const debug = debugFactory( 'calypso:me:security:social-login' );

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

	disconnectFromGoogle = () => {
		this.props.disconnectSocialUser( 'google' ).then( () => this.refreshUser() );
	};

	handleGoogleLoginResponse = ( response ) => {
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
				{
					errorUpdatingSocialConnection &&
						<Notice status={ 'is-error' } showDismiss={ false }>
							{ errorUpdatingSocialConnection.message }
						</Notice>
				}
				<CompactCard>
					{ translate( 'You’ll be able to log in faster by linking your WordPress.com account with your ' +
						'social networks. We’ll never post without your permission.' ) }
				</CompactCard>
				{ this.renderGoogleConnection() }
			</div>
		);
	}

	renderActionButton( onClickAction = null ) {
		const { isUserConnectedToGoogle, isUpdatingSocialConnection, translate } = this.props;
		const buttonLabel = isUserConnectedToGoogle ? translate( 'Disconnect' ) : translate( 'Connect' );
		const disableButton = isUpdatingSocialConnection || this.state.fetchingUser;

		return (
			<FormButton
				className="social-login__button button"
				disabled={ disableButton }
				compact={ true }
				isPrimary={ ! isUserConnectedToGoogle }
				onClick={ onClickAction }>
				{ buttonLabel }
			</FormButton>
		);
	}

	renderGoogleConnection() {
		const { isUserConnectedToGoogle } = this.props;

		return (
			<CompactCard>
				<div className="social-login__header">
					<div className="social-login__header-info">
						<div className="social-login__header-icon">
							<GoogleIcon width="30" height="30" />
						</div>
						<h3>Google</h3>
					</div>

					<div className="social-login__header-action">
						{
							isUserConnectedToGoogle
								? this.renderActionButton( this.disconnectFromGoogle )
								: <GoogleLoginButton
									clientId={ config( 'google_oauth_client_id' ) }
									responseHandler={ this.handleGoogleLoginResponse }>
									{ this.renderActionButton() }
								</GoogleLoginButton>
						}
					</div>
				</div>
			</CompactCard>
		);
	}

	render() {
		const title = this.props.translate( 'Social Login', { textOnly: true } );

		return (
			<Main className="social-login">
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
	( state ) => {
		const currentUser = getCurrentUser( state );

		return {
			isUserConnectedToGoogle: currentUser && currentUser.social_signup_service === 'google',
			isUpdatingSocialConnection: isRequesting( state ),
			errorUpdatingSocialConnection: getRequestError( state ),
		};
	},
	{
		connectSocialUser,
		disconnectSocialUser,
	}
)( localize( SocialLogin ) );
