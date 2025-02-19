import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import AppleLoginButton from 'calypso/components/social-buttons/apple';
import GithubLoginButton from 'calypso/components/social-buttons/github';
import GoogleSocialButton from 'calypso/components/social-buttons/google';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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
		userHasDisconnected: false,
	};

	refreshUser = async () => {
		this.setState( { fetchingUser: true } );

		await this.props.fetchCurrentUser();

		this.setState( { fetchingUser: false } );
	};

	recordLoginSuccess = ( service ) => {
		this.props.recordTracksEvent( 'calypso_account_social_connect_success', {
			social_account_type: service,
		} );
	};

	handleButtonClick = async () => {
		const { isConnected, service } = this.props;

		if ( isConnected ) {
			this.props.recordTracksEvent( 'calypso_account_social_disconnect_button_click', {
				social_account_type: service,
			} );
			try {
				await this.disconnectFromSocialService();
				this.props.recordTracksEvent( 'calypso_account_social_disconnect_success', {
					social_account_type: service,
				} );
			} catch ( error ) {
				this.props.recordTracksEvent( 'calypso_account_social_disconnect_failure', {
					error_code: error.code,
					social_account_type: service,
				} );
			}
		} else {
			this.props.recordTracksEvent( 'calypso_account_social_connect_button_click', {
				social_account_type: service,
			} );
		}
	};

	handleSocialServiceResponse = ( response ) => {
		const { service } = this.props;

		let socialInfo = {
			service,
		};

		if ( service === 'google' ) {
			this.recordLoginSuccess( service );

			socialInfo = {
				...socialInfo,
				access_token: response.access_token,
				id_token: response.id_token,
			};
		}

		if ( service === 'apple' ) {
			if ( ! response.id_token ) {
				return;
			}

			this.recordLoginSuccess( service );

			const userData = response.user || {};

			socialInfo = {
				...socialInfo,
				id_token: response.id_token,
				user_name: userData.name,
				user_email: userData.email,
			};
		}

		if ( service === 'github' ) {
			this.recordLoginSuccess( service );

			socialInfo = {
				...socialInfo,
				access_token: response.access_token,
			};
		}

		return this.props.connectSocialUser( socialInfo ).then( this.refreshUser );
	};

	disconnectFromSocialService = () => {
		const { service } = this.props;
		return this.props.disconnectSocialUser( service ).then( () => {
			this.refreshUser();
			this.setState( { userHasDisconnected: true } );
		} );
	};

	render() {
		const { service, isConnected, isUpdatingSocialConnection, redirectUri, translate } = this.props;

		const { fetchingUser, userHasDisconnected } = this.state;

		const buttonLabel = isConnected ? translate( 'Disconnect' ) : translate( 'Connect' );
		const disabled = isUpdatingSocialConnection || fetchingUser;

		const actionButton = (
			<FormButton
				className="social-login__button button"
				disabled={ disabled }
				compact
				isPrimary={ ! isConnected }
				onClick={ this.handleButtonClick }
			>
				{ buttonLabel }
			</FormButton>
		);

		if ( isConnected ) {
			return actionButton;
		}

		if ( service === 'google' ) {
			return (
				<GoogleSocialButton
					onClick={ this.handleButtonClick }
					responseHandler={ this.handleSocialServiceResponse }
					startingPoint="account-social-connect"
				>
					{ actionButton }
				</GoogleSocialButton>
			);
		}

		if ( service === 'apple' ) {
			return (
				<AppleLoginButton
					onClick={ this.handleButtonClick }
					responseHandler={ this.handleSocialServiceResponse }
					socialServiceResponse={ this.props.socialServiceResponse }
				>
					{ actionButton }
				</AppleLoginButton>
			);
		}

		if ( service === 'github' ) {
			return (
				<GithubLoginButton
					onClick={ this.handleButtonClick }
					responseHandler={ this.handleSocialServiceResponse }
					socialServiceResponse={ this.props.socialServiceResponse }
					userHasDisconnected={ userHasDisconnected }
					overrideRedirectUri={ redirectUri }
				>
					{ actionButton }
				</GithubLoginButton>
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
		recordTracksEvent,
	}
)( localize( SocialLoginActionButton ) );
