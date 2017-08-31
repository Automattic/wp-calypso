/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
const debug = debugFactory( 'calypso:me:security:social-login' );

/**
 * Internal dependencies
 */
import config from 'config';
import CompactCard from 'components/card/compact';
import SectionHeader from 'components/section-header';
import DocumentHead from 'components/data/document-head';
import FormButton from 'components/forms/form-button';
import Main from 'components/main';
import MeSidebarNavigation from 'me/sidebar-navigation';
import ReauthRequired from 'me/reauth-required';
import SecuritySectionNav from 'me/security-section-nav';
import twoStepAuthorization from 'lib/two-step-authorization';
import { getCurrentUser } from 'state/current-user/selectors';
import { connectSocialUser, disconnectSocialUser } from 'state/login/actions';
import { isRequesting, getRequestError } from 'state/login/selectors';
import GoogleIcon from 'components/social-icons/google';
import GoogleLoginButton from 'components/social-buttons/google';
import userFactory from 'lib/user';

const user = userFactory();

class SocialLogin extends Component {
	static displayName = 'SocialLogin';

	static propTypes = {
		moment: PropTypes.func,
		path: PropTypes.string,
		translate: PropTypes.func.isRequired,
		userSettings: PropTypes.object,
	};

	componentDidMount() {
		debug( this.constructor.displayName + ' React component has mounted.' );
	}

	componentWillUnmount() {
		debug( this.constructor.displayName + ' React component is unmounting.' );
	}

	disconnectFromGoogle = () => {
		this.props.disconnectSocialUser( 'google' ).then( () => user.fetch() );
	};

	handleGoogleResponse = ( response ) => {
		if ( ! response.Zi || ! response.Zi.access_token || ! response.Zi.id_token ) {
			return;
		}

		const socialInfo = {
			service: 'google',
			access_token: response.Zi.access_token,
			id_token: response.Zi.id_token,
		};

		return this.props.connectSocialUser( socialInfo ).then( () => user.fetch() );
	};

	renderContent() {
		const { translate } = this.props;

		return (
			<div>
				<SectionHeader label={ translate( 'Manage Social Login Connections' ) } />
				<CompactCard>
					{ translate( 'You’ll be able to log in faster by linking your WordPress.com account with your ' +
						'social networks. We’ll never post without your permission.' ) }
				</CompactCard>
				{ this.renderGoogleConnection() }
			</div>
		);
	}

	renderGoogleConnection() {
		const { isUserConnectedToGoogle, isUpdatingSocialConnection, translate } = this.props;
		const buttonLabel = isUserConnectedToGoogle ? translate( 'Disconnect' ) : translate( 'Connect' );

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
								? <FormButton
									compact={ true }
									disabled={ isUpdatingSocialConnection }
									isPrimary={ false }
									onClick={ this.disconnectFromGoogle }>
									{ buttonLabel }
								</FormButton>
								: <GoogleLoginButton
									clientId={ config( 'google_oauth_client_id' ) }
									responseHandler={ this.handleGoogleResponse } >
									<FormButton
										compact={ true }
										disabled={ isUpdatingSocialConnection }
										isPrimary={ true }
										onClick={ this.disconnectFromGoogle }>
										{ buttonLabel }
									</FormButton>
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
