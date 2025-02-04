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
import { isWpccFlow } from 'calypso/signup/is-flow';
import { recordTracksEvent as recordTracks } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import getIsWoo from 'calypso/state/selectors/get-is-woo';

class SocialSignupForm extends Component {
	static propTypes = {
		compact: PropTypes.bool,
		handleResponse: PropTypes.func.isRequired,
		setCurrentStep: PropTypes.func,
		translate: PropTypes.func.isRequired,
		socialServiceResponse: PropTypes.object,
		disableTosText: PropTypes.bool,
		flowName: PropTypes.string,
		redirectToAfterLoginUrl: PropTypes.string,
		isSocialFirst: PropTypes.bool,
	};

	static defaultProps = {
		compact: false,
	};

	handleSignup = ( result ) => {
		const { recordTracksEvent, isDevAccount, handleResponse } = this.props;
		recordTracksEvent( 'calypso_signup_social_button_success', {
			social_account_type: result.service,
		} );

		window.sessionStorage?.removeItem( 'login_redirect_to' );

		handleResponse( result.service, result.access_token, result.id_token, {
			...result,
			is_dev_account: result.service === 'github' ? true : isDevAccount,
		} );
	};

	trackSignupAndRememberRedirect = ( event ) => {
		const service = event.currentTarget.getAttribute( 'data-social-service' );

		const { recordTracksEvent, oauth2Client, redirectToAfterLoginUrl, showErrorNotice, translate } =
			this.props;

		recordTracksEvent( 'calypso_signup_social_button_click', {
			social_account_type: service,
			client_id: oauth2Client?.id,
		} );

		try {
			if ( redirectToAfterLoginUrl && typeof window !== 'undefined' ) {
				window.sessionStorage.setItem( 'signup_redirect_to', redirectToAfterLoginUrl );
			}
		} catch ( error ) {
			showErrorNotice(
				translate(
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
			socialServiceResponse,
			disableTosText,
			isSocialFirst,
			flowName,
			isWoo,
			setCurrentStep,
		} = this.props;

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
							responseHandler={ this.handleSignup }
							onClick={ this.trackSignupAndRememberRedirect }
						/>

						<AppleLoginButton
							responseHandler={ this.handleSignup }
							onClick={ this.trackSignupAndRememberRedirect }
							socialServiceResponse={ socialServiceResponse }
							queryString={ isWpccFlow( flowName ) ? window?.location?.search?.slice( 1 ) : '' }
						/>

						<GithubSocialButton
							responseHandler={ this.handleSignup }
							onClick={ this.trackSignupAndRememberRedirect }
							socialServiceResponse={ socialServiceResponse }
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
		const devAccountLandingPageRefs = [ 'hosting-lp', 'developer-lp' ];
		const isDevAccount = devAccountLandingPageRefs.includes( query?.ref );

		return {
			recordTracksEvent: recordTracks,
			currentRoute: getCurrentRoute( state ),
			oauth2Client: getCurrentOAuth2Client( state ),
			isDevAccount: isDevAccount,
			isWoo: getIsWoo( state ),
		};
	},
	{ showErrorNotice: errorNotice }
)( localize( SocialSignupForm ) );
