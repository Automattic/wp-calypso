import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SocialToS from 'calypso/blocks/authentication/social/social-tos.jsx';
import {
	GoogleSocialButton,
	AppleLoginButton,
	GithubSocialButton,
	UsernameOrEmailButton,
} from 'calypso/components/social-buttons';
import { preventWidows } from 'calypso/lib/formatting';
import { isWooOAuth2Client } from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import { isWpccFlow } from 'calypso/signup/is-flow';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import isWooCommerceCoreProfilerFlow from 'calypso/state/selectors/is-woocommerce-core-profiler-flow';

class SocialSignupForm extends Component {
	static propTypes = {
		compact: PropTypes.bool,
		handleResponse: PropTypes.func.isRequired,
		setCurrentStep: PropTypes.func,
		translate: PropTypes.func.isRequired,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		disableTosText: PropTypes.bool,
		flowName: PropTypes.string,
		redirectToAfterLoginUrl: PropTypes.string,
		isSocialFirst: PropTypes.bool,
	};

	static defaultProps = {
		compact: false,
	};

	handleAppleResponse = ( response ) => {
		if ( ! response.id_token ) {
			return;
		}

		const extraUserData = { is_dev_account: this.props.isDevAccount };

		if ( response.user ) {
			extraUserData.user_name = response.user.name;
			extraUserData.user_email = response.user.email;
		}

		this.props.handleResponse( 'apple', null, response.id_token, extraUserData );
	};

	handleGoogleResponse = ( tokens, triggeredByUser = true ) => {
		if ( ! triggeredByUser && this.props.socialService !== 'google' ) {
			return;
		}

		this.props.recordTracksEvent( 'calypso_signup_social_button_success', {
			social_account_type: 'google',
		} );

		this.props.handleResponse( 'google', tokens.access_token, tokens.id_token, {
			is_dev_account: this.props.isDevAccount,
		} );
	};

	handleGitHubResponse = ( { access_token }, triggeredByUser = true ) => {
		if ( ! triggeredByUser && this.props.socialService !== 'github' ) {
			return;
		}

		this.props.recordTracksEvent( 'calypso_signup_social_button_success', {
			social_account_type: 'github',
		} );

		this.props.handleResponse( 'github', access_token, null, {
			// Make accounts signed up via GitHub as dev accounts
			is_dev_account: true,
		} );
	};

	trackSocialSignup = ( service ) => {
		this.props.recordTracksEvent( 'calypso_signup_social_button_click', {
			social_account_type: service,
			client_id: this.props.oauth2Client?.id,
		} );
	};

	shouldUseRedirectFlow() {
		const { currentRoute } = this.props;

		// If calypso is loaded in a popup, we don't want to open a second popup for social signup
		// let's use the redirect flow instead in that case
		let isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;

		// Jetpack Connect-in-place auth flow contains special reserved args, so we want a popup for social signup.
		// See p1HpG7-7nj-p2 for more information.
		if ( isPopup && '/jetpack/connect/authorize' === currentRoute ) {
			isPopup = false;
		}

		return isPopup;
	}

	getRedirectUri = ( socialService ) => {
		const origin = typeof window !== 'undefined' && window.location.origin;
		const pathname = typeof window !== 'undefined' && window.location.pathname;

		// If the user is in the WPCC flow, we want to redirect user to login callback so that we can automatically log them in.
		if ( isWpccFlow( this.props.flowName ) ) {
			return `${ origin + login( { socialService } ) }`;
		}

		if ( socialService === 'github' ) {
			return `${ origin }${ pathname }`;
		}

		return `${ origin }/start/user`;
	};

	trackLoginAndRememberRedirect = ( service ) => {
		this.trackSocialSignup( service );

		try {
			if ( this.props.redirectToAfterLoginUrl && typeof window !== 'undefined' ) {
				window.sessionStorage.setItem( 'signup_redirect_to', this.props.redirectToAfterLoginUrl );
			}
		} catch ( error ) {
			this.props.showErrorNotice(
				this.props.translate(
					'Error accessing sessionStorage. {{a}}Please check your browser settings{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/support/browser-issues/' ) }
									target="_blank"
									rel="noreferrer"
								/>
							),
						},
					}
				)
			);
		}
	};

	render() {
		const {
			compact,
			translate,
			socialService,
			socialServiceResponse,
			disableTosText,
			isSocialFirst,
			flowName,
			isWoo,
			setCurrentStep,
		} = this.props;

		const uxMode = this.shouldUseRedirectFlow() ? 'redirect' : 'popup';

		return (
			<Card
				className={ clsx( 'auth-form__social', 'is-signup', {
					'is-social-first': isSocialFirst,
				} ) }
			>
				{ ! compact && (
					<p className="auth-form__social-text">
						{ preventWidows( translate( 'Or create an account using:' ) ) }
					</p>
				) }

				<div className="auth-form__social-buttons">
					<div className="auth-form__social-buttons-container">
						<GoogleSocialButton
							clientId={ config( 'google_oauth_client_id' ) }
							responseHandler={ this.handleGoogleResponse }
							uxMode={ uxMode }
							redirectUri={ this.getRedirectUri( 'google' ) }
							onClick={ () => {
								this.trackLoginAndRememberRedirect( 'google' );
							} }
							socialServiceResponse={ socialService === 'google' ? socialServiceResponse : null }
							startingPoint="signup"
						/>

						<AppleLoginButton
							clientId={ config( 'apple_oauth_client_id' ) }
							responseHandler={ this.handleAppleResponse }
							uxMode={ uxMode }
							redirectUri={ this.getRedirectUri( 'apple' ) }
							onClick={ () => {
								this.trackLoginAndRememberRedirect( 'apple' );
							} }
							socialServiceResponse={ socialService === 'apple' ? socialServiceResponse : null }
							originalUrlPath={ window?.location?.pathname }
							queryString={ isWpccFlow( flowName ) ? window?.location?.search?.slice( 1 ) : '' }
						/>

						<GithubSocialButton
							socialServiceResponse={ socialService === 'github' ? socialServiceResponse : null }
							redirectUri={ this.getRedirectUri( 'github' ) }
							responseHandler={ this.handleGitHubResponse }
							onClick={ () => {
								this.trackLoginAndRememberRedirect( 'github' );
							} }
						/>
						{ isSocialFirst && (
							<UsernameOrEmailButton onClick={ () => setCurrentStep( 'email' ) } />
						) }
					</div>
					{ ! isWoo && ! disableTosText && <SocialToS /> }
				</div>
				{ isWoo && ! disableTosText && <SocialToS /> }
			</Card>
		);
	}
}

export default connect(
	( state ) => {
		const query = getCurrentQueryArguments( state );
		const isDevAccount = query?.ref === 'hosting-lp' || query?.ref === 'developer-lp';

		return {
			currentRoute: getCurrentRoute( state ),
			oauth2Client: getCurrentOAuth2Client( state ),
			isDevAccount: isDevAccount,
			isWoo:
				isWooOAuth2Client( getCurrentOAuth2Client( state ) ) ||
				isWooCommerceCoreProfilerFlow( state ),
		};
	},
	{ recordTracksEvent, showErrorNotice: errorNotice }
)( localize( SocialSignupForm ) );
