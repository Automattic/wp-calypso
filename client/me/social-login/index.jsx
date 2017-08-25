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
import GoogleIcon from 'components/social-icons/google';

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

	toggleSocialConnection = () => {
		// TODO: update social connection on the server
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
				{ this.renderSocialConnection() }
			</div>
		);
	}

	renderSocialConnection() {
		const { isUserConnectedToGoogle, isUpdatingSocialConnection, translate } = this.props;

		return (
			<CompactCard>
				<div className="security-social-login-connection__header">
					<div className="security-account-recovery-contact__header-info">
						<div className="security-social-login-connection__header-icon">
							<GoogleIcon width="30" height="30" />
						</div>
						<h3>Google</h3>
					</div>

					<div className="security-social-login-connection__header-action">
						<FormButton
							compact={ true }
							disabled={ isUpdatingSocialConnection }
							isPrimary={ ! isUserConnectedToGoogle }
							onClick={ this.toggleSocialConnection }>
							{ isUserConnectedToGoogle ? translate( 'Disconnect' ) : translate( 'Connect' ) }
						</FormButton>
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
		const user = getCurrentUser( state );

		return {
			isUserConnectedToGoogle: user && user.social_signup_service === 'google',
			isUpdatingSocialConnection: false,
		};
	}
)( localize( SocialLogin ) );
