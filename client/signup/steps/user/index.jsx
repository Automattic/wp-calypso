import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { localizeUrl } from '@automattic/i18n-utils';
import { isHostingSignupFlow, isNewsletterFlow } from '@automattic/onboarding';
import { WPCC } from '@automattic/urls';
import { isMobile } from '@automattic/viewport';
import { Button } from '@wordpress/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import { get, isEmpty, omit } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import A4ALogo from 'calypso/a8c-for-agencies/components/a4a-logo';
import SignupForm from 'calypso/blocks/signup-form';
import JetpackLogo from 'calypso/components/jetpack-logo';
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
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import flows from 'calypso/signup/config/flows';
import GravatarStepWrapper from 'calypso/signup/gravatar-step-wrapper';
import StepWrapper from 'calypso/signup/step-wrapper';
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
import getIsBlazePro from 'calypso/state/selectors/get-is-blaze-pro';
import getIsWCCOM from 'calypso/state/selectors/get-is-wccom';
import getIsWoo from 'calypso/state/selectors/get-is-woo';
import getWccomFrom from 'calypso/state/selectors/get-wccom-from';
import { getIsOnboardingAffiliateFlow } from 'calypso/state/signup/flow/selectors';
import { getSuggestedUsername } from 'calypso/state/signup/optional-dependencies/selectors';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';

import './style.scss';

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
			wccomFrom,
			isOnboardingAffiliateFlow,
			isWCCOM,
		} = this.props;

		let subHeaderText = this.props.subHeaderText;
		const loginUrl = this.getLoginUrl();

		if ( [ 'wpcc', 'crowdsignal' ].includes( flowName ) && oauth2Client ) {
			if ( isWCCOM ) {
				switch ( wccomFrom ) {
					case 'cart':
						subHeaderText = translate(
							"You'll need an account to complete your purchase and manage your subscription"
						);
						break;
					case 'nux':
						subHeaderText = translate(
							'All Woo Express stores are powered by WordPress.com. Please create an account to continue. Already registered? {{a}}Log in{{/a}}',
							{
								components: {
									a: <a href={ loginUrl } />,
									br: <br />,
								},
								comment:
									'Link displayed on the Signup page to users having account to log in WooCommerce via WordPress.com',
							}
						);
						break;
					default:
						subHeaderText = translate(
							'Please create an account to continue. Already registered? {{a}}Log in{{/a}}',
							{
								components: {
									a: <a href={ loginUrl } />,
									br: <br />,
								},
								comment:
									'Link displayed on the Signup page to users having account to log in WooCommerce via WordPress.com',
							}
						);
				}
			} else if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
				subHeaderText = translate(
					'By creating an account via any of the options below, {{br/}}you agree to our {{a}}Terms of Service{{/a}}.',
					{
						components: {
							a: (
								<a
									href={ localizeUrl( 'https://wordpress.com/tos/' ) }
									target="_blank"
									rel="noopener noreferrer"
								/>
							),
							br: <br />,
						},
					}
				);
			} else if ( isBlazeProOAuth2Client( oauth2Client ) ) {
				subHeaderText = translate( 'Create your new Blaze Pro account.' );
			} else {
				subHeaderText = translate(
					'Not sure what this is all about? {{a}}We can help clear that up for you.{{/a}}',
					{
						components: {
							a: <a href={ localizeUrl( WPCC ) } target="_blank" rel="noopener noreferrer" />,
						},
						comment:
							'Text displayed on the Signup page to users willing to sign up for an app via WordPress.com',
					}
				);
			}
		} else if ( 1 === getFlowSteps( flowName, userLoggedIn ).length ) {
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
			userLoggedIn,
			isBlazePro,
			isWCCOM,
		} = this.props;

		if ( userLoggedIn ) {
			if ( isBlazePro ) {
				return translate( 'Log in to your Blaze Pro account' );
			}
			return translate( 'Is this you?' );
		}

		if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
			return translate( 'Sign up for Crowdsignal' );
		}

		if ( isWCCOM ) {
			if ( 'cart' === wccomFrom ) {
				return <WooCommerceConnectCartHeader />;
			}

			return (
				<div className={ clsx( 'signup-form__woo-wrapper' ) }>
					<h3>{ translate( 'Create an account' ) }</h3>
				</div>
			);
		}

		if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
			return (
				<div className={ clsx( 'signup-form__wrapper' ) }>
					<JetpackLogo full={ false } size={ 60 } />
					<h3>{ translate( 'Sign up to Jetpack.com with a WordPress.com account.' ) }</h3>
				</div>
			);
		}

		if ( isA4AOAuth2Client( oauth2Client ) ) {
			return (
				<div className={ clsx( 'signup-form__wrapper' ) }>
					<A4ALogo size={ 60 } />
					<h3>
						{ translate( 'Sign up to Automattic for Agencies with a WordPress.com account.' ) }
					</h3>
				</div>
			);
		}

		if ( isBlazeProOAuth2Client( oauth2Client ) ) {
			return translate( 'Welcome to %(clientTitle)s', {
				args: { clientTitle: oauth2Client.title },
				comment:
					"'clientTitle' is the name of the app that uses WordPress.com Connect (e.g. 'Akismet' or 'VaultPress')",
			} );
		}

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
		const { translate, isWCCOM } = this.props;

		if ( isWCCOM ) {
			return translate( 'Get started' );
		}

		if ( this.userCreationPending() ) {
			return translate( 'Creating Your Account…' );
		}

		return translate( 'Create your account' );
	}

	renderSignupForm() {
		const { oauth2Client, isWCCOM, isWoo } = this.props;
		const isPasswordless =
			isMobile() ||
			this.props.isPasswordless ||
			isNewsletterFlow( this.props?.queryObject?.variationName ) ||
			isWoo;
		let socialService;
		let socialServiceResponse;
		let isSocialSignupEnabled = this.props.isSocialSignupEnabled;

		if ( isWCCOM ) {
			isSocialSignupEnabled = true;
		}

		if ( isBlazeProOAuth2Client( oauth2Client ) ) {
			isSocialSignupEnabled = false;
		}

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
					shouldDisplayUserExistsError={ ! isWCCOM && ! isBlazeProOAuth2Client( oauth2Client ) }
					isSocialFirst={ this.props.isSocialFirst }
					labelText={ isWoo ? this.props.translate( 'Your email' ) : null }
				/>
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
			! this.props.isWCCOM &&
			! isPartnerPortalOAuth2Client( this.props.oauth2Client )
		) {
			return null; // return nothing so that we don't see the completed signup form flash but skip for Woo because it need to keep the form until the user is redirected back to original page (e.g. WooCommerce.com).
		}

		if ( isGravatarOAuth2Client( this.props.oauth2Client ) && ! this.props.userLoggedIn ) {
			return this.renderGravatarSignupStep();
		}

		if ( this.props.isWCCOM && this.props.userLoggedIn ) {
			page( this.getLoginUrl() );
			return null;
		}

		// TODO: decouple hideBack flag from the flow name.
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				headerText={ this.getHeaderText() }
				subHeaderText={ this.getSubHeaderText() }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.translate( 'Create your account.' ) }
				stepContent={ this.renderSignupForm() }
				customizedActionButtons={ this.getCustomizedActionButtons() }
				isSticky={ this.getIsSticky() }
			/>
		);
	}
}

const ConnectedUser = connect(
	( state ) => {
		const oauth2Client = getCurrentOAuth2Client( state );

		return {
			oauth2Client: oauth2Client,
			suggestedUsername: getSuggestedUsername( state ),
			wccomFrom: getWccomFrom( state ),
			isWCCOM: getIsWCCOM( state ),
			isWoo: getIsWoo( state ),
			isBlazePro: getIsBlazePro( state ),
			from: get( getCurrentQueryArguments( state ), 'from' ),
			userLoggedIn: isUserLoggedIn( state ),
			isOnboardingAffiliateFlow: getIsOnboardingAffiliateFlow( state ),
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
