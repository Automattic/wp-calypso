import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { isHostingSignupFlow, isNewsletterFlow } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { localize, fixMe } from 'i18n-calypso';
import { get, isEmpty, omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import SignupForm from 'calypso/blocks/signup-form';
import LocaleSuggestions from 'calypso/components/locale-suggestions';
import WooCommerceConnectCartHeader from 'calypso/components/woocommerce-connect-cart-header';
import WPCloudLogo from 'calypso/components/wp-cloud-logo';
import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import { getSocialServiceFromClientId } from 'calypso/lib/login';
import {
	isA4AOAuth2Client,
	isBlazeProOAuth2Client,
	isCrowdsignalOAuth2Client,
	isGravatarOAuth2Client,
	isJetpackCloudOAuth2Client,
	isPartnerPortalOAuth2Client,
	isVIPOAuth2Client,
	isStudioAppOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import LoginContextProvider, { useLoginContext } from 'calypso/login/login-context';
import OneLoginLayout from 'calypso/login/wp-login/components/one-login-layout';
import getHeadingSubText from 'calypso/login/wp-login/hooks/get-heading-subtext';
import getNoThanksRedirectUrl from 'calypso/login/wp-login/hooks/get-no-thanks-redirect';
import flows from 'calypso/signup/config/flows';
import GravatarStepWrapper from 'calypso/signup/gravatar-step-wrapper';
import {
	getFlowDestination,
	getFlowSteps,
	getNextStepName,
	getPreviousStepName,
	getStepUrl,
} from 'calypso/signup/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { loginSocialUser } from 'calypso/state/login/actions';
import { errorNotice } from 'calypso/state/notices/actions';
import { fetchOAuth2ClientData } from 'calypso/state/oauth2-clients/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getIsAkismet from 'calypso/state/selectors/get-is-akismet';
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWoo from 'calypso/state/selectors/get-is-woo';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
import isWooJPCFlow from 'calypso/state/selectors/is-woo-jpc-flow';
import { getIsOnboardingAffiliateFlow } from 'calypso/state/signup/flow/selectors';
import { getSuggestedUsername } from 'calypso/state/signup/optional-dependencies/selectors';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import './style.scss';

// Wrapper component to set headers in login context
const LoginContextWrapper = ( { children, headerText, subHeaderText } ) => {
	const { setHeaders } = useLoginContext();

	React.useEffect( () => {
		setHeaders( {
			heading: headerText,
			subHeading: subHeaderText?.primary,
			subHeadingSecondary: subHeaderText?.secondary,
		} );
	}, [ setHeaders, headerText, subHeaderText ] );

	return children;
};

function getRedirectToAfterLoginUrl( {
	oauth2Signup,
	initialContext,
	flowName,
	localeSlug,
	progress,
	signupDependencies,
	stepName,
	userLoggedIn,
} ) {
	if (
		oauth2Signup &&
		initialContext?.query?.oauth2_redirect &&
		isOauth2RedirectValid( initialContext.query.oauth2_redirect )
	) {
		return initialContext.query.oauth2_redirect;
	}
	if ( initialContext?.canonicalPath?.startsWith( '/start/account' ) ) {
		return initialContext.query.redirect_to;
	}

	const stepAfterRedirect =
		getNextStepName( flowName, stepName, userLoggedIn ) ||
		getPreviousStepName( flowName, stepName, userLoggedIn );

	if ( ! stepAfterRedirect ) {
		// This is the only step in the flow
		const goesThroughCheckout = !! progress?.plans?.cartItem;
		const destination = getFlowDestination(
			flowName,
			userLoggedIn,
			signupDependencies,
			localeSlug,
			goesThroughCheckout
		);
		if ( destination ) {
			return destination;
		}
	}

	return (
		window.location.origin +
		getStepUrl( flowName, stepAfterRedirect, '', '', initialContext?.query )
	);
}

function isOauth2RedirectValid( oauth2Redirect ) {
	// Allow Google sign-up to work.
	// See: https://github.com/Automattic/wp-calypso/issues/49572
	if ( oauth2Redirect === undefined ) {
		return true;
	}

	if ( oauth2Redirect.startsWith( '/setup/wooexpress' ) ) {
		return true;
	}

	try {
		const url = new URL( oauth2Redirect );
		return url.host === 'public-api.wordpress.com';
	} catch {
		return false;
	}
}

export class UserStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		oauth2Client: PropTypes.object,
		translate: PropTypes.func,
		subHeaderText: PropTypes.string,
		isSocialSignupEnabled: PropTypes.bool,
		initialContext: PropTypes.object,
	};

	static defaultProps = {
		isSocialSignupEnabled: false,
	};

	state = {
		recaptchaClientId: null,
	};

	componentDidUpdate( prevProps ) {
		if (
			prevProps.step?.status !== this.props.step?.status &&
			this.props.step?.status === 'completed'
		) {
			this.props.goToNextStep();
		}
	}

	componentDidMount() {
		if ( this.props.step?.status === 'completed' ) {
			this.props.goToNextStep();
			return;
		}

		if ( flows.getFlow( this.props.flowName, this.props.userLoggedIn )?.showRecaptcha ) {
			this.initGoogleRecaptcha();
		}

		this.props.saveSignupStep( { stepName: this.props.stepName } );

		const clientId = get( this.props.initialContext, 'query.oauth2_client_id', null );
		if ( this.props.oauth2Signup && clientId ) {
			this.props.fetchOAuth2ClientData( clientId );
		}
	}

	getLoginUrl() {
		const { oauth2Client, wccomFrom, sectionName, from, locale, step } = this.props;
		const emailAddress = step?.form?.email?.value ?? step?.form?.email;

		return login( {
			isJetpack: 'jetpack-connect' === sectionName,
			from,
			redirectTo: getRedirectToAfterLoginUrl( this.props ),
			locale,
			oauth2ClientId: oauth2Client?.id,
			wccomFrom,
			signupUrl: window.location.pathname + window.location.search,
			emailAddress,
		} );
	}

	getSubHeaderText() {
		const {
			flowName,
			oauth2Client,
			positionInFlow,
			translate,
			userLoggedIn,
			isOnboardingAffiliateFlow,
		} = this.props;

		let subHeaderText = this.props.subHeaderText;
		const loginUrl = this.getLoginUrl();

		if ( 1 === getFlowSteps( flowName, userLoggedIn ).length ) {
			// Displays specific sub header if users only want to create an account, without a site
			subHeaderText = translate( 'Welcome to the WordPress.com community.' );
		}

		if ( 0 === positionInFlow ) {
			if ( this.props.isSocialFirst ) {
				subHeaderText = '';
			} else {
				const { queryObject } = this.props;
				if ( queryObject?.variationName && isNewsletterFlow( queryObject.variationName ) ) {
					subHeaderText = translate( 'Already have a WordPress.com account? {{a}}Log in{{/a}}', {
						components: { a: <a href={ loginUrl } rel="noopener noreferrer" /> },
					} );
				} else if ( isHostingSignupFlow( flowName ) ) {
					subHeaderText = translate(
						'The most reliable WordPress platform awaits you. Have an account? {{a}}Log in{{/a}}',
						{
							components: { a: <a href={ loginUrl } rel="noopener noreferrer" /> },
						}
					);
				} else if ( isBlazeProOAuth2Client( oauth2Client ) ) {
					subHeaderText = translate( 'First, create your WordPress.com account.' );
				} else {
					subHeaderText = translate(
						'First, create your WordPress.com account. Have an account? {{a}}Log in{{/a}}',
						{
							components: { a: <a href={ loginUrl } rel="noopener noreferrer" /> },
						}
					);
				}
			}
		}

		if ( isOnboardingAffiliateFlow ) {
			subHeaderText = translate(
				"Thanks for stopping by! You're a few steps away from building your perfect website. Let's do this."
			);
		}

		const redirectToAfterLoginUrl = getRedirectToAfterLoginUrl( this.props );

		if ( redirectToAfterLoginUrl?.startsWith( '/setup/site-migration' ) ) {
			subHeaderText = translate(
				'Pick an option to start moving your site to the world’s best WordPress host.'
			);
		} else if ( redirectToAfterLoginUrl?.startsWith( '/start/do-it-for-me' ) ) {
			subHeaderText = translate( 'Pick an option to start shaping your dream website with us.' );
		}

		if ( isPartnerPortalOAuth2Client( oauth2Client ) ) {
			if ( document.location.search?.includes( 'wpcloud' ) ) {
				subHeaderText = translate(
					'Create a {{a}}WordPress.com{{/a}} account using a shared team email address (e.g., wpcloud@yourdomain.com) to enable collaborative access for your team members.',
					{
						components: {
							a: <a href="https://wordpress.com" />,
						},
					}
				);
			}
		}

		if ( this.props.userLoggedIn ) {
			subHeaderText = '';
		}

		return subHeaderText;
	}

	initGoogleRecaptcha() {
		initGoogleRecaptcha( 'g-recaptcha', config( 'google_recaptcha_site_key' ) ).then(
			( clientId ) => {
				if ( clientId === null ) {
					return;
				}

				this.setState( { recaptchaClientId: clientId } );

				this.props.saveSignupStep( {
					stepName: this.props.stepName,
				} );
			}
		);
	}

	save = ( form ) => {
		this.props.saveSignupStep( {
			stepName: this.props.stepName,
			form,
		} );
	};

	submit = ( data ) => {
		const { flowName, stepName, oauth2Signup } = this.props;
		const dependencies = {};
		if ( oauth2Signup ) {
			dependencies.oauth2_client_id = data.queryArgs.oauth2_client_id;
			dependencies.oauth2_redirect = data.queryArgs.oauth2_redirect;
		} else if ( data.queryArgs.redirect_to ) {
			dependencies.redirect = data.queryArgs.redirect_to;
		}
		this.props.submitSignupStep(
			{
				flowName,
				stepName,
				oauth2Signup,
				...data,
			},
			dependencies
		);
	};

	submitForm = async ( form, userData, analyticsData ) => {
		const formWithoutPassword = {
			...form,
			password: {
				...form.password,
				value: '',
			},
		};

		this.props.recordTracksEvent( 'calypso_signup_user_step_submit', {
			flow: this.props.flowName,
			step: this.props.stepName,
			...analyticsData,
		} );

		const isRecaptchaLoaded = typeof this.state.recaptchaClientId === 'number';

		let recaptchaToken = undefined;
		let recaptchaDidntLoad = false;
		let recaptchaFailed = false;

		if ( flows.getFlow( this.props.flowName, this.props.userLoggedIn )?.showRecaptcha ) {
			if ( isRecaptchaLoaded ) {
				recaptchaToken = await recordGoogleRecaptchaAction(
					this.state.recaptchaClientId,
					'calypso/signup/formSubmit'
				);

				if ( ! recaptchaToken ) {
					recaptchaFailed = true;
				}
			} else {
				recaptchaDidntLoad = true;
			}
		}

		this.submit( {
			userData,
			form: formWithoutPassword,
			queryArgs: this.props.initialContext?.query || {},
			recaptchaDidntLoad,
			recaptchaFailed,
			recaptchaToken: recaptchaToken || undefined,
		} );
	};

	/**
	 * Handle Social service authentication flow result (OAuth2 or OpenID Connect)
	 * @param {string} service      The name of the social service
	 * @param {string} access_token An OAuth2 acccess token
	 * @param {string} id_token     (Optional) a JWT id_token which contains the signed user info
	 *                              So our server doesn't have to request the user profile on its end.
	 * @param {Object} userData     (Optional) extra user information that can be used to create a new account
	 */
	handleSocialResponse = ( service, access_token, id_token = null, userData = null ) => {
		const { translate, initialContext } = this.props;

		if ( ! isOauth2RedirectValid( initialContext?.query?.oauth2_redirect ) ) {
			this.props.errorNotice(
				translate( 'An unexpected error occurred. Please try again later.' )
			);
			return;
		}

		const query = initialContext?.query || {};
		if ( typeof window !== 'undefined' && window.sessionStorage.getItem( 'signup_redirect_to' ) ) {
			query.redirect_to = window.sessionStorage.getItem( 'signup_redirect_to' );
			window.sessionStorage.removeItem( 'signup_redirect_to' );
		}

		const socialInfo = {
			service: service,
			access_token: access_token,
			id_token: id_token,
		};

		this.props.loginSocialUser( socialInfo, '' ).finally( () => {
			this.submit( {
				service,
				access_token,
				id_token,
				userData,
				queryArgs: query,
			} );
		} );
	};

	userCreationComplete() {
		return this.props.step && 'completed' === this.props.step.status;
	}

	userCreationPending() {
		return this.props.step && 'pending' === this.props.step.status;
	}

	userCreationStarted() {
		return this.userCreationPending() || this.userCreationComplete();
	}

	getHeaderText() {
		const {
			flowName,
			oauth2Client,
			translate,
			headerText,
			wccomFrom,
			isSocialFirst,
			isWoo,
			isCrowdsignal,
			isAkismet,
			isVIPClient,
			isA4A,
			isJetpackCloud,
			isStudioApp,
			isBlazePro,
		} = this.props;

		/**
		 * BEGIN: Unified create account
		 */

		// TODO clk This will encompass all unified OAuth2 clients,
		// similar to get-header-text in wp-login (potentially the two being merged too)
		if (
			( oauth2Client &&
				( isCrowdsignal ||
					isVIPClient ||
					isA4A ||
					isBlazePro ||
					isJetpackCloud ||
					isStudioApp ) ) ||
			isAkismet
		) {
			let clientName = oauth2Client?.name;

			if ( isAkismet ) {
				clientName = 'Akismet';
			} else if ( isA4A ) {
				clientName = 'Automattic for Agencies';
			} else if ( isBlazePro ) {
				clientName = 'Blaze Pro';
			} else if ( isVIPClient ) {
				clientName = 'VIP';
			} else if ( isJetpackCloud ) {
				clientName = 'Jetpack Cloud';
			}

			return fixMe( {
				text: 'Sign up for {{span}}%(client)s{{/span}} with WordPress.com',
				newCopy: translate( 'Sign up for {{span}}%(client)s{{/span}} with WordPress.com', {
					args: { client: clientName },
					components: { span: <span className="wp-login__one-login-header-client-name" /> },
				} ),
				oldCopy: translate( 'Create your account' ),
			} );
		}

		if ( isStudioApp ) {
			const clientName = 'Studio';
			return translate( 'Sign up for {{span}}%(client)s{{/span}} with WordPress.com', {
				args: { client: clientName },
				components: { span: <span className="wp-login__one-login-header-client-name" /> },
			} );
		}

		if ( isWoo ) {
			if ( 'cart' === wccomFrom ) {
				return <WooCommerceConnectCartHeader />;
			}

			return (
				<span className={ clsx( 'signup-form__woo-wrapper' ) }>
					{ translate( 'Create an account with WordPress.com' ) }
				</span>
			);
		}
		/**
		 * END: Unified create account
		 */

		if ( isPartnerPortalOAuth2Client( oauth2Client ) ) {
			if ( document.location.search?.includes( 'wpcloud' ) ) {
				return (
					<div className={ clsx( 'signup-form__wrapper' ) }>
						<WPCloudLogo size={ 256 } />
						<h5>{ translate( 'Apply to become a hosting partner.' ) }</h5>
					</div>
				);
			}
		}

		if ( flowName === 'wpcc' && oauth2Client ) {
			return translate( 'Sign up for %(clientTitle)s with a WordPress.com account', {
				args: { clientTitle: oauth2Client.title },
				comment:
					"'clientTitle' is the name of the app that uses WordPress.com Connect (e.g. 'Akismet' or 'VaultPress')",
			} );
		}

		const params = new URLSearchParams( window.location.search );
		if ( isNewsletterFlow( params.get( 'variationName' ) ) || isHostingSignupFlow( flowName ) ) {
			return translate( 'Let’s get you signed up.' );
		}

		if ( isSocialFirst ) {
			return translate( 'Create your account' );
		}

		return headerText;
	}

	submitButtonText() {
		const { translate } = this.props;

		if ( this.userCreationPending() ) {
			return translate( 'Creating Your Account…' );
		}

		return translate( 'Create your account' );
	}

	renderSignupForm() {
		const { oauth2Client, isWoo } = this.props;
		const isPasswordless = true;
		let socialService;
		let socialServiceResponse;
		const isSocialSignupEnabled = true;

		const hashObject = this.props.initialContext && this.props.initialContext.hash;
		if ( isSocialSignupEnabled && ! isEmpty( hashObject ) ) {
			const clientId = hashObject.client_id;
			socialService = getSocialServiceFromClientId( clientId );
			if ( socialService ) {
				socialServiceResponse = hashObject;
			}
		}
		return (
			<>
				<SignupForm
					{ ...omit( this.props, [ 'translate' ] ) }
					step={ this.props.step }
					email={ this.props.queryObject?.email_address || '' }
					redirectToAfterLoginUrl={ getRedirectToAfterLoginUrl( this.props ) }
					disabled={ this.userCreationStarted() }
					submitting={ this.userCreationStarted() }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.submitButtonText() }
					suggestedUsername={ this.props.suggestedUsername }
					handleSocialResponse={ this.handleSocialResponse }
					isPasswordless={ isPasswordless }
					queryArgs={ this.props.initialContext?.query || {} }
					isSocialSignupEnabled={ isSocialSignupEnabled }
					socialService={ socialService }
					socialServiceResponse={ socialServiceResponse }
					recaptchaClientId={ this.state.recaptchaClientId }
					horizontal
					shouldDisplayUserExistsError={ ! isWoo && ! isBlazeProOAuth2Client( oauth2Client ) }
					isSocialFirst={ this.props.isSocialFirst }
					labelText={ this.props.translate( 'Your email' ) }
					disableTosText={ ! isGravatarOAuth2Client( oauth2Client ) }
				/>
				{ ! isGravatarOAuth2Client( oauth2Client ) && (
					<LocaleSuggestions path={ this.props.path } locale={ this.props.locale } />
				) }
				<div id="g-recaptcha"></div>
			</>
		);
	}

	renderGravatarSignupStep() {
		const { flowName, stepName, positionInFlow, translate, oauth2Client } = this.props;

		return (
			<GravatarStepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ translate( 'Welcome to Gravatar' ) }
				subHeaderText={ translate(
					'Provide your email address and we will send you a magic link to log in.'
				) }
				loginUrl={ this.getLoginUrl() }
				logo={ { url: oauth2Client.icon, alt: oauth2Client.title } }
			>
				{ this.renderSignupForm() }
			</GravatarStepWrapper>
		);
	}

	getCustomizedActionButtons() {
		if ( this.props.isSocialFirst ) {
			return (
				<Button
					className="step-wrapper__navigation-link forward"
					href={ this.getLoginUrl() }
					variant="link"
				>
					<span>{ this.props.translate( 'Log in' ) }</span>
				</Button>
			);
		}
	}

	getIsSticky() {
		if ( this.props.isSocialFirst ) {
			return false;
		}
	}

	render() {
		if (
			this.userCreationComplete() &&
			! this.props.isWoo &&
			! isPartnerPortalOAuth2Client( this.props.oauth2Client )
		) {
			return null; // return nothing so that we don't see the completed signup form flash but skip for Woo because it need to keep the form until the user is redirected back to original page (e.g. WooCommerce.com).
		}

		if ( isGravatarOAuth2Client( this.props.oauth2Client ) && ! this.props.userLoggedIn ) {
			return this.renderGravatarSignupStep();
		}

		if ( this.props.userLoggedIn ) {
			page( this.getLoginUrl() );
			return null;
		}

		// Check for "No, thanks" URL in WooCommerce flows
		const query = this.props.initialContext?.query || {};
		const noThanksRedirectUrl = getNoThanksRedirectUrl( { currentQuery: query } );

		return (
			<LoginContextProvider>
				<LoginContextWrapper
					headerText={ this.getHeaderText() }
					subHeaderText={ getHeadingSubText( {
						isSocialFirst: true,
						twoFactorAuthType: false,
						translate: this.props.translate,
						isWooJPC: this.props.isWooJPC,
					} ) }
				>
					<OneLoginLayout
						isJetpack={ false }
						isSectionSignup
						loginUrl={ this.getLoginUrl() }
						noThanksRedirectUrl={ noThanksRedirectUrl }
					>
						{ this.renderSignupForm() }
					</OneLoginLayout>
				</LoginContextWrapper>
			</LoginContextProvider>
		);
	}
}

const ConnectedUser = connect(
	( state ) => {
		const oauth2Client = getCurrentOAuth2Client( state );
		const isWoo = getIsWoo( state );
		const isA4A = isA4AOAuth2Client( oauth2Client );
		const isBlazePro = getIsBlazePro( state );
		const isCrowdsignal = isCrowdsignalOAuth2Client( oauth2Client );
		const isAkismet = getIsAkismet( state );
		const isVIPClient = isVIPOAuth2Client( oauth2Client );
		const isJetpackCloud = isJetpackCloudOAuth2Client( oauth2Client );
		const isStudioApp = isStudioAppOAuth2Client( oauth2Client );

		return {
			oauth2Client: oauth2Client,
			suggestedUsername: getSuggestedUsername( state ),
			wccomFrom: getWccomFrom( state ),
			isWoo,
			isWooJPC: isWooJPCFlow( state ),
			isBlazePro,
			from: get( getCurrentQueryArguments( state ), 'from' ),
			userLoggedIn: isUserLoggedIn( state ),
			isOnboardingAffiliateFlow: getIsOnboardingAffiliateFlow( state ),
			isA4A,
			isCrowdsignal,
			isAkismet,
			isVIPClient,
			isJetpackCloud,
			isStudioApp,
		};
	},
	{
		errorNotice,
		recordTracksEvent,
		fetchOAuth2ClientData,
		saveSignupStep,
		submitSignupStep,
		loginSocialUser,
	}
)( localize( UserStep ) );

export default ConnectedUser;
