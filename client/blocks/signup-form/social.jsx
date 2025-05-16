import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import SocialToS from 'calypso/blocks/authentication/social/social-tos.jsx';
import { useSocialLoginExperiment } from 'calypso/blocks/login/use-social-login-experiment';
import {
	GoogleSocialButton,
	AppleLoginButton,
	GithubSocialButton,
	UsernameOrEmailButton,
} from 'calypso/components/social-buttons';
import { isWpccFlow } from 'calypso/signup/is-flow';
import { recordTracksEvent as recordTracks } from 'calypso/state/analytics/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getIsWoo from 'calypso/state/selectors/get-is-woo';

const SocialSignupForm = ( {
	compact = false,
	handleResponse,
	setCurrentStep,
	socialServiceResponse,
	disableTosText,
	flowName,
	redirectToAfterLoginUrl,
	isSocialFirst,
	isDevAccount: propIsDevAccount,
} ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ isLoading, experimentAssignment ] = useSocialLoginExperiment();
	const isTreatment = experimentAssignment?.variationName === 'treatment';
	const shouldShowApple = ! isLoading && ! isTreatment;

	const currentQuery = useSelector( getCurrentQueryArguments );
	const oauth2Client = useSelector( getCurrentOAuth2Client );
	const isWoo = useSelector( getIsWoo );

	const devAccountLandingPageRefs = [ 'hosting-lp', 'developer-lp' ];
	const isDevAccount = propIsDevAccount ?? devAccountLandingPageRefs.includes( currentQuery?.ref );

	const handleSignup = ( result ) => {
		dispatch(
			recordTracks( 'calypso_signup_social_button_success', {
				social_account_type: result.service,
			} )
		);

		window.sessionStorage?.removeItem( 'login_redirect_to' );

		handleResponse( result.service, result.access_token, result.id_token, {
			...result,
			is_dev_account: result.service === 'github' ? true : isDevAccount,
		} );
	};

	const trackSignupAndRememberRedirect = ( event ) => {
		const service = event.currentTarget.getAttribute( 'data-social-service' );

		dispatch(
			recordTracks( 'calypso_signup_social_button_click', {
				social_account_type: service,
				client_id: oauth2Client?.id,
			} )
		);

		try {
			if ( redirectToAfterLoginUrl && typeof window !== 'undefined' ) {
				window.sessionStorage.setItem( 'signup_redirect_to', redirectToAfterLoginUrl );
			}
		} catch ( error ) {
			dispatch(
				errorNotice(
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
				)
			);
		}
	};

	return (
		<Card
			className={ clsx( 'auth-form__social', 'is-signup', {
				'is-social-first': isSocialFirst,
			} ) }
		>
			{ ! compact && (
				<p className="auth-form__social-text">{ translate( 'Or create an account using:' ) }</p>
			) }

			<div className="auth-form__social-buttons">
				<div className="auth-form__social-buttons-container">
					<GoogleSocialButton
						responseHandler={ handleSignup }
						onClick={ trackSignupAndRememberRedirect }
					/>

					{ shouldShowApple && (
						<AppleLoginButton
							responseHandler={ handleSignup }
							onClick={ trackSignupAndRememberRedirect }
							socialServiceResponse={ socialServiceResponse }
							queryString={ isWpccFlow( flowName ) ? window?.location?.search?.slice( 1 ) : '' }
						/>
					) }

					<GithubSocialButton
						responseHandler={ handleSignup }
						onClick={ trackSignupAndRememberRedirect }
						socialServiceResponse={ socialServiceResponse }
					/>
					{ isSocialFirst && <UsernameOrEmailButton onClick={ () => setCurrentStep( 'email' ) } /> }
				</div>
				{ ! isWoo && ! disableTosText && <SocialToS /> }
			</div>
			{ isWoo && ! disableTosText && <SocialToS /> }
		</Card>
	);
};

SocialSignupForm.propTypes = {
	compact: PropTypes.bool,
	handleResponse: PropTypes.func.isRequired,
	setCurrentStep: PropTypes.func,
	socialServiceResponse: PropTypes.object,
	disableTosText: PropTypes.bool,
	flowName: PropTypes.string,
	redirectToAfterLoginUrl: PropTypes.string,
	isSocialFirst: PropTypes.bool,
	isDevAccount: PropTypes.bool,
};

export default SocialSignupForm;
