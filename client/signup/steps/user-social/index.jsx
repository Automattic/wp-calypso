import config from '@automattic/calypso-config';
import { localizeUrl } from '@automattic/i18n-utils';
import { isNewsletterFlow } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { isEmpty, omit, get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SignupFormSocialFirst from 'calypso/blocks/signup-form-social-first';
import JetpackLogo from 'calypso/components/jetpack-logo';
import WooCommerceConnectCartHeader from 'calypso/components/woocommerce-connect-cart-header';
import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import detectHistoryNavigation from 'calypso/lib/detect-history-navigation';
import { getSocialServiceFromClientId } from 'calypso/lib/login';
import {
	isCrowdsignalOAuth2Client,
	isWooOAuth2Client,
	isJetpackCloudOAuth2Client,
	isGravatarOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import { login } from 'calypso/lib/paths';
import { WPCC } from 'calypso/lib/url/support';
import flows from 'calypso/signup/config/flows';
import GravatarStepWrapper from 'calypso/signup/gravatar-step-wrapper';
import P2StepWrapper from 'calypso/signup/p2-step-wrapper';
import StepWrapper from 'calypso/signup/step-wrapper';
import {
	getFlowDestination,
	getFlowSteps,
	getNextStepName,
	getPreviousStepName,
	getStepUrl,
	isP2Flow,
	isVideoPressFlow,
} from 'calypso/signup/utils';
import VideoPressStepWrapper from 'calypso/signup/videopress-step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { errorNotice } from 'calypso/state/notices/actions';
import { fetchOAuth2ClientData } from 'calypso/state/oauth2-clients/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
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
	if (
		initialContext?.canonicalPath?.startsWith( '/start/account' ) ||
		initialContext?.canonicalPath?.startsWith( '/start/videopress-account' )
	) {
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

	componentDidUpdate() {
		if ( this.props.step?.status === 'completed' ) {
			this.props.goToNextStep();
			return;
		}

		if ( this.userCreationCompletedAndHasHistory( this.props ) ) {
			// It looks like the user just completed the User Registartion Step
			// And clicked the back button. Lets redirect them to the this page but this time they will be logged in.
			const url = new URL( window.location );
			const searchParams = url.searchParams;
			searchParams.set( 'user_completed', true );
			url.search = searchParams.toString();
			// Redirect to itself and append ?user_completed
			window.location.replace( url.toString() );
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
		const { oauth2Client, wccomFrom, isReskinned, sectionName, from, locale } = this.props;

		return login( {
			isJetpack: 'jetpack-connect' === sectionName,
			from,
			redirectTo: getRedirectToAfterLoginUrl( this.props ),
			locale,
			oauth2ClientId: oauth2Client?.id,
			wccomFrom,
			isWhiteLogin: isReskinned,
			signupUrl: window.location.pathname + window.location.search,
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
			isReskinned,
		} = this.props;

		let subHeaderText = this.props.subHeaderText;
		const loginUrl = this.getLoginUrl();

		if ( [ 'wpcc', 'crowdsignal' ].includes( flowName ) && oauth2Client ) {
			if ( isWooOAuth2Client( oauth2Client ) && wccomFrom ) {
				subHeaderText =
					'cart' === wccomFrom
						? translate(
								"You'll need an account to complete your purchase and manage your subscription"
						  )
						: translate(
								"You'll need an account to connect your store and manage your extensions"
						  );
			} else if ( isWooOAuth2Client( oauth2Client ) && ! wccomFrom ) {
				subHeaderText = translate(
					'All Woo Express stores are powered by WordPress.com.{{br/}}Please create an account to continue. Already registered? {{a}}Log in{{/a}}',
					{
						components: {
							a: <a href={ loginUrl } />,
							br: <br />,
						},
						comment:
							'Link displayed on the Signup page to users having account to log in WooCommerce via WordPress.com',
					}
				);
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
		} else if ( 'videopress-account' === flowName ) {
			subHeaderText = translate(
				"First, you'll need a WordPress.com account. Already have one? {{a}}Log in{{/a}}",
				{
					components: {
						a: <a href={ loginUrl } />,
					},
					comment:
						'Link displayed on the VideoPress signup page for users to log in with a WordPress.com account',
				}
			);
		} else if ( 1 === getFlowSteps( flowName, userLoggedIn ).length ) {
			// Displays specific sub header if users only want to create an account, without a site
			subHeaderText = translate( 'Welcome to the WordPress.com community.' );
		}

		if ( isReskinned && 0 === positionInFlow ) {
			subHeaderText = '';
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
	 *
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

		this.submit( {
			service,
			access_token,
			id_token,
			userData,
			queryArgs: query,
		} );
	};

	userCreationComplete() {
		return this.props.step && 'completed' === this.props.step.status;
	}

	userCreationCompletedAndHasHistory( props ) {
		return 'completed' === props.step?.status && detectHistoryNavigation.loadedViaHistory();
	}

	userCreationPending() {
		return this.props.step && 'pending' === this.props.step.status;
	}

	userCreationStarted() {
		return this.userCreationPending() || this.userCreationComplete();
	}

	getHeaderText() {
		const { flowName, oauth2Client, translate, headerText, wccomFrom } = this.props;

		if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
			return translate( 'Sign up for Crowdsignal' );
		}

		if ( isWooOAuth2Client( oauth2Client ) ) {
			if ( 'cart' === wccomFrom ) {
				return <WooCommerceConnectCartHeader />;
			}

			return (
				<div className={ classNames( 'signup-form__woo-wrapper' ) }>
					<h3>{ translate( "Let's get started" ) }</h3>
				</div>
			);
		}

		if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
			return (
				<div className={ classNames( 'signup-form__jetpack-cloud-wrapper' ) }>
					<JetpackLogo full={ false } size={ 60 } />
					<h3>{ translate( 'Sign up to Jetpack.com with a WordPress.com account.' ) }</h3>
				</div>
			);
		}

		if ( flowName === 'wpcc' && oauth2Client ) {
			return translate( 'Sign up for %(clientTitle)s with a WordPress.com account', {
				args: { clientTitle: oauth2Client.title },
				comment:
					"'clientTitle' is the name of the app that uses WordPress.com Connect (e.g. 'Akismet' or 'VaultPress')",
			} );
		}

		const params = new URLSearchParams( window.location.search );
		if ( isNewsletterFlow( params.get( 'variationName' ) ) ) {
			return translate( 'Let’s get you signed up.' );
		}

		if ( ! headerText ) {
			return translate( 'Create your account' );
		}

		return headerText;
	}

	submitButtonText() {
		const { translate, flowName } = this.props;

		if ( isP2Flow( flowName ) ) {
			return translate( 'Continue' );
		}

		if ( isVideoPressFlow( flowName ) ) {
			return translate( 'Continue' );
		}

		if ( isWooOAuth2Client( this.props.oauth2Client ) ) {
			return translate( 'Get started' );
		}

		if ( this.userCreationPending() ) {
			return translate( 'Creating Your Account…' );
		}

		if ( this.userCreationComplete() ) {
			return translate( 'Account created - Go to next step' );
		}

		return translate( 'Create your account' );
	}

	renderSignupForm() {
		const { oauth2Client, isReskinned } = this.props;
		let socialService;
		let socialServiceResponse;
		let isSocialSignupEnabled = this.props.isSocialSignupEnabled;

		if ( isWooOAuth2Client( oauth2Client ) ) {
			isSocialSignupEnabled = true;
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
				<SignupFormSocialFirst
					{ ...omit( this.props, [ 'translate' ] ) }
					email={ this.props.queryObject?.email_address || '' }
					redirectToAfterLoginUrl={ getRedirectToAfterLoginUrl( this.props ) }
					disabled={ this.userCreationStarted() }
					submitting={ this.userCreationStarted() }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.submitButtonText() }
					suggestedUsername={ this.props.suggestedUsername }
					handleSocialResponse={ this.handleSocialResponse }
					queryArgs={ this.props.initialContext?.query || {} }
					isSocialSignupEnabled={ isSocialSignupEnabled }
					socialService={ socialService }
					socialServiceResponse={ socialServiceResponse }
					recaptchaClientId={ this.state.recaptchaClientId }
					horizontal={ false }
					isReskinned={ isReskinned }
					shouldDisplayUserExistsError={ ! isWooOAuth2Client( oauth2Client ) }
				/>
				<div id="g-recaptcha"></div>
			</>
		);
	}

	renderVideoPressSignupStep() {
		return (
			<VideoPressStepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ this.props.translate( 'Let’s get you signed up' ) }
				subHeaderText={ this.getSubHeaderText() }
				stepIndicator={ this.props.translate( 'Step %(currentStep)s of %(totalSteps)s', {
					args: {
						currentStep: 1,
						totalSteps: 1,
					},
				} ) }
			>
				{ this.renderSignupForm() }
			</VideoPressStepWrapper>
		);
	}

	renderP2SignupStep() {
		return (
			<P2StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ this.props.translate( 'Sign up' ) }
				subHeaderText={ this.props.translate(
					"First, let's create your account. We recommend you use the {{strong}}same email address you use at work.{{/strong}}",
					{
						components: { strong: <strong /> },
					}
				) }
				stepIndicator={ this.props.translate( 'Step %(currentStep)s of %(totalSteps)s', {
					args: {
						currentStep: 1,
						totalSteps: 3,
					},
				} ) }
			>
				{ this.renderSignupForm() }
			</P2StepWrapper>
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

	render() {
		if ( isP2Flow( this.props.flowName ) ) {
			return this.renderP2SignupStep();
		}

		if ( isVideoPressFlow( this.props.flowName ) ) {
			return this.renderVideoPressSignupStep();
		}

		if ( isGravatarOAuth2Client( this.props.oauth2Client ) && ! this.props.userLoggedIn ) {
			return this.renderGravatarSignupStep();
		}

		if ( this.userCreationCompletedAndHasHistory( this.props ) ) {
			return null; // return nothing so that we don't see the error message and the sign up form.
		}

		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				headerText={ this.getHeaderText() }
				subHeaderText={ this.getSubHeaderText() }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.translate( 'Create your account.' ) }
				stepContent={ this.renderSignupForm() }
				isSticky={ false }
				customizedActionButtons={
					<Button
						className="step-wrapper__navigation-link forward"
						href={ this.getLoginUrl() }
						variant="link"
					>
						<span>{ this.props.translate( 'Log in' ) }</span>
					</Button>
				}
			/>
		);
	}
}

export default connect(
	( state ) => ( {
		oauth2Client: getCurrentOAuth2Client( state ),
		suggestedUsername: getSuggestedUsername( state ),
		wccomFrom: get( getCurrentQueryArguments( state ), 'wccom-from' ),
		from: get( getCurrentQueryArguments( state ), 'from' ),
		userLoggedIn: isUserLoggedIn( state ),
	} ),
	{
		errorNotice,
		recordTracksEvent,
		fetchOAuth2ClientData,
		saveSignupStep,
		submitSignupStep,
	}
)( localize( UserStep ) );
