import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import AppleLoginButton from 'calypso/components/social-buttons/apple';
import GoogleLoginButton from 'calypso/components/social-buttons/google';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { connectSocialUser, disconnectSocialUser } from 'calypso/state/login/actions';
import { isRequesting } from 'calypso/state/login/selectors';

class SocialLoginActionButton extends Component {
	static propTypes = {
		service: PropTypes.string.isRequired,
		isConnected: PropTypes.bool.isRequired,
		isUpdatingSocialConnection: PropTypes.bool.isRequired,
		translate: PropTypes.func.isRequired,
		connectSocialUser: PropTypes.func.isRequired,
		disconnectSocialUser: PropTypes.func.isRequired,
		socialServiceResponse: PropTypes.object,
		redirectUri: PropTypes.string,
	};

	state = {
		fetchingUser: false,
	};

	refreshUser = async () => {
		this.setState( { fetchingUser: true } );

		await this.props.fetchCurrentUser();

		this.setState( { fetchingUser: false } );
	};

	handleSocialServiceResponse = ( response ) => {
		const { service } = this.props;

		let socialInfo = {
			service,
		};

		if ( service === 'google' ) {
			if ( ! response.getAuthResponse ) {
				return;
			}

			const tokens = response.getAuthResponse();

			if ( ! tokens || ! tokens.access_token || ! tokens.id_token ) {
				return;
			}

			socialInfo = {
				...socialInfo,
				access_token: tokens.access_token,
				id_token: tokens.id_token,
			};
		}

		if ( service === 'apple' ) {
			if ( ! response.id_token ) {
				return;
			}

			const userData = response.user || {};

			socialInfo = {
				...socialInfo,
				id_token: response.id_token,
				user_name: userData.name,
				user_email: userData.email,
			};
		}

		return this.props.connectSocialUser( socialInfo ).then( this.refreshUser );
	};

	disconnectFromSocialService = () => {
		const { service } = this.props;
		this.props.disconnectSocialUser( service ).then( this.refreshUser );
	};

	render() {
		const { service, isConnected, isUpdatingSocialConnection, redirectUri, translate } = this.props;

		const { fetchingUser } = this.state;

		const buttonLabel = isConnected ? translate( 'Disconnect' ) : translate( 'Connect' );
		const disabled = isUpdatingSocialConnection || fetchingUser;

		const actionButton = (
			<FormButton
				className="social-login__button button"
				disabled={ disabled }
				compact={ true }
				isPrimary={ ! isConnected }
				onClick={ isConnected && this.disconnectFromSocialService }
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
					responseHandler={ this.handleSocialServiceResponse }
				>
					{ actionButton }
				</GoogleLoginButton>
			);
		}

		if ( service === 'apple' ) {
			const uxMode = config.isEnabled( 'sign-in-with-apple/redirect' ) ? 'redirect' : 'popup';
			return (
				<AppleLoginButton
					clientId={ config( 'apple_oauth_client_id' ) }
					uxMode={ uxMode }
					responseHandler={ this.handleSocialServiceResponse }
					redirectUri={ redirectUri }
					socialServiceResponse={ this.props.socialServiceResponse }
				>
					{ actionButton }
				</AppleLoginButton>
			);
		}

		return null;
	}
}

export default connect(
	( state ) => ( {
		isUpdatingSocialConnection: isRequesting( state ),
	} ),
	{
		connectSocialUser,
		disconnectSocialUser,
		fetchCurrentUser,
	}
)( localize( SocialLoginActionButton ) );
