/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, includes, isEmpty, omit, get } from 'lodash';
import classNames from 'classnames';
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import { isCrowdsignalOAuth2Client, isWooOAuth2Client } from 'lib/oauth2-clients';
import StepWrapper from 'signup/step-wrapper';
import flows from 'signup/config/flows';
import SignupForm from 'blocks/signup-form';
import { getFlowSteps, getNextStepName, getPreviousStepName, getStepUrl } from 'signup/utils';
import { fetchOAuth2ClientData } from 'state/oauth2-clients/actions';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import getCurrentQueryArguments from 'state/selectors/get-current-query-arguments';
import { getSuggestedUsername } from 'state/signup/optional-dependencies/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import { WPCC } from 'lib/url/support';
import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'lib/analytics/recaptcha';
import config from 'config';
import AsyncLoad from 'components/async-load';
import WooCommerceConnectCartHeader from 'extensions/woocommerce/components/woocommerce-connect-cart-header';
import { getSocialServiceFromClientId } from 'lib/login';
import { abtest } from 'lib/abtest';

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
		translate: identity,
		suggestedUsername: identity,
		isSocialSignupEnabled: false,
	};

	state = {
		submitting: false,
		subHeaderText: '',
		recaptchaClientId: null,
	};

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.step && 'invalid' === nextProps.step.status ) {
			this.setState( { submitting: false } );
		}

		if (
			this.props.flowName !== nextProps.flowName ||
			this.props.subHeaderText !== nextProps.subHeaderText
		) {
			this.setSubHeaderText( nextProps );
		}
	}

	UNSAFE_componentWillMount() {
		const { oauth2Signup, initialContext } = this.props;
		const clientId = get( initialContext, 'query.oauth2_client_id', null );

		this.setSubHeaderText( this.props );

		if ( oauth2Signup && clientId ) {
			this.props.fetchOAuth2ClientData( clientId );
		}
	}

	componentDidMount() {
		if ( flows.getFlow( this.props.flowName )?.showRecaptcha ) {
			this.initGoogleRecaptcha();
		}

		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	setSubHeaderText( props ) {
		const { flowName, oauth2Client, positionInFlow, translate, wccomFrom } = props;

		let subHeaderText = props.subHeaderText;

		if ( includes( [ 'wpcc', 'crowdsignal' ], flowName ) && oauth2Client ) {
			if (
				config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
				isWooOAuth2Client( oauth2Client ) &&
				wccomFrom
			) {
				subHeaderText =
					'cart' === wccomFrom
						? translate(
								"You'll need an account to complete your purchase and manage your subscription"
						  )
						: translate(
								"You'll need an account to connect your store and manage your extensions"
						  );
			} else if ( isWooOAuth2Client( oauth2Client ) && ! wccomFrom ) {
				subHeaderText = translate( '{{a}}Learn more about the benefits{{/a}}', {
					components: {
						a: (
							<a
								href="https://woocommerce.com/2017/01/woocommerce-requires-wordpress-account/"
								target="_blank"
								rel="noopener noreferrer"
							/>
						),
					},
					comment:
						'Link displayed on the Signup page to users willing to sign up for WooCommerce via WordPress.com',
				} );
			} else if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
				subHeaderText = translate(
					'By creating an account via any of the options below, {{br/}}you agree to our {{a}}Terms of Service{{/a}}.',
					{
						components: {
							a: <a href="https://wordpress.com/tos/" target="_blank" rel="noopener noreferrer" />,
							br: <br />,
						},
					}
				);
			} else {
				subHeaderText = translate(
					'Not sure what this is all about? {{a}}We can help clear that up for you.{{/a}}',
					{
						components: {
							a: <a href={ WPCC } target="_blank" rel="noopener noreferrer" />,
						},
						comment:
							'Text displayed on the Signup page to users willing to sign up for an app via WordPress.com',
					}
				);
			}
		} else if ( 1 === getFlowSteps( flowName ).length ) {
			// Displays specific sub header if users only want to create an account, without a site
			subHeaderText = translate( 'Welcome to the WordPress.com community.' );
		}

		if ( positionInFlow === 0 && flowName === 'onboarding' ) {
			subHeaderText = translate( 'First, create your WordPress.com account.' );
		}

		this.setState( { subHeaderText } );
	}

	initGoogleRecaptcha() {
		initGoogleRecaptcha(
			'g-recaptcha',
			'calypso/signup/pageLoad',
			config( 'google_recaptcha_site_key' )
		).then( ( result ) => {
			if ( ! result ) {
				return;
			}

			this.setState( { recaptchaClientId: result.clientId } );

			this.props.saveSignupStep( {
				stepName: this.props.stepName,
				recaptchaToken: typeof result.token === 'string' ? result.token : undefined,
			} );
		} );
	}

	isEligibleForSwapStepsTest() {
		const cookies = cookie.parse( document.cookie );
		const countryCodeFromCookie = cookies.country_code;
		const isUserFromUS = 'US' === countryCodeFromCookie;

		if ( isUserFromUS && 'onboarding' === this.props.flowName ) {
			return true;
		}

		return false;
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

		if (
			this.isEligibleForSwapStepsTest() &&
			'variantShowSwapped' === abtest( 'domainStepPlanStepSwap' )
		) {
			const switchFlowName = 'onboarding-plan-first';
			this.props.goToNextStep( switchFlowName );
		}

		this.props.goToNextStep();
	};

	submitForm = async ( form, userData, analyticsData ) => {
		const formWithoutPassword = {
			...form,
			password: {
				...form.password,
				value: '',
			},
		};

		this.props.recordTracksEvent( 'calypso_signup_user_step_submit', analyticsData );

		const isRecaptchaLoaded = typeof this.state.recaptchaClientId === 'number';

		let recaptchaToken = undefined;
		let recaptchaDidntLoad = false;
		let recaptchaFailed = false;

		if ( flows.getFlow( this.props.flowName )?.showRecaptcha ) {
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
			queryArgs: ( this.props.initialContext && this.props.initialContext.query ) || {},
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
	 * @param {object} userData     (Optional) extra user information that can be used to create a new account
	 */
	handleSocialResponse = ( service, access_token, id_token = null, userData = null ) => {
		this.submit( {
			service,
			access_token,
			id_token,
			userData,
			queryArgs: ( this.props.initialContext && this.props.initialContext.query ) || {},
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
		const { flowName, oauth2Client, translate, headerText, wccomFrom } = this.props;

		if ( isCrowdsignalOAuth2Client( oauth2Client ) ) {
			return translate( 'Sign up for Crowdsignal' );
		}

		if ( isWooOAuth2Client( oauth2Client ) && wccomFrom ) {
			return (
				<Fragment>
					{ 'cart' === wccomFrom ? (
						<WooCommerceConnectCartHeader />
					) : (
						<div className={ classNames( 'signup-form__woocommerce-wrapper' ) }>
							<div className={ classNames( 'signup-form__woocommerce-logo' ) }>
								<svg width={ 200 } viewBox={ '0 0 1270 170' }>
									<AsyncLoad
										require="components/jetpack-header/woocommerce"
										darkColorScheme={ false }
										placeholder={ null }
									/>
								</svg>
							</div>
						</div>
					) }
					<div className={ classNames( 'signup-form__woocommerce-heading' ) }>
						{ translate( 'Create a WordPress.com account' ) }
					</div>
				</Fragment>
			);
		}

		if ( includes( [ 'wpcc' ], flowName ) && oauth2Client ) {
			return translate( 'Sign up for %(clientTitle)s with a WordPress.com account', {
				args: { clientTitle: oauth2Client.title },
				comment:
					"'clientTitle' is the name of the app that uses WordPress.com Connect (e.g. 'Akismet' or 'VaultPress')",
			} );
		}

		return headerText;
	}

	getRedirectToAfterLoginUrl() {
		if (
			this.props.oauth2Signup &&
			this.props.initialContext &&
			this.props.initialContext.query.oauth2_redirect
		) {
			return this.props.initialContext.query.oauth2_redirect;
		}

		const stepAfterRedirect =
			getNextStepName( this.props.flowName, this.props.stepName ) ||
			getPreviousStepName( this.props.flowName, this.props.stepName );
		return this.originUrl() + getStepUrl( this.props.flowName, stepAfterRedirect );
	}

	originUrl() {
		return (
			window.location.protocol +
			'//' +
			window.location.hostname +
			( window.location.port ? ':' + window.location.port : '' )
		);
	}

	submitButtonText() {
		const { translate } = this.props;

		if ( this.userCreationPending() ) {
			return translate( 'Creating Your Account…' );
		}

		if ( this.userCreationComplete() ) {
			return translate( 'Account created - Go to next step' );
		}

		return translate( 'Create your account' );
	}

	renderSignupForm() {
		const { oauth2Client, wccomFrom } = this.props;
		let socialService, socialServiceResponse;
		let isSocialSignupEnabled = this.props.isSocialSignupEnabled;
		const hashObject = this.props.initialContext && this.props.initialContext.hash;
		if ( this.props.isSocialSignupEnabled && ! isEmpty( hashObject ) ) {
			const clientId = hashObject.client_id;
			socialService = getSocialServiceFromClientId( clientId );

			if ( socialService ) {
				socialServiceResponse = hashObject;
			}
		}

		if (
			config.isEnabled( 'woocommerce/onboarding-oauth' ) &&
			isWooOAuth2Client( oauth2Client ) &&
			wccomFrom
		) {
			isSocialSignupEnabled = true;
		}

		return (
			<>
				<SignupForm
					{ ...omit( this.props, [ 'translate' ] ) }
					redirectToAfterLoginUrl={ this.getRedirectToAfterLoginUrl() }
					disabled={ this.userCreationStarted() }
					submitting={ this.userCreationStarted() }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.submitButtonText() }
					suggestedUsername={ this.props.suggestedUsername }
					handleSocialResponse={ this.handleSocialResponse }
					isSocialSignupEnabled={ isSocialSignupEnabled }
					socialService={ socialService }
					socialServiceResponse={ socialServiceResponse }
					recaptchaClientId={ this.state.recaptchaClientId }
					showRecaptchaToS={ flows.getFlow( this.props.flowName )?.showRecaptcha }
				/>
				<div id="g-recaptcha"></div>
			</>
		);
	}

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				headerText={ this.getHeaderText() }
				subHeaderText={ this.state.subHeaderText }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.props.translate( 'Create your account.' ) }
				stepContent={ this.renderSignupForm() }
			/>
		);
	}
}

export default connect(
	( state ) => ( {
		oauth2Client: getCurrentOAuth2Client( state ),
		suggestedUsername: getSuggestedUsername( state ),
		wccomFrom: get( getCurrentQueryArguments( state ), 'wccom-from' ),
	} ),
	{
		recordTracksEvent,
		fetchOAuth2ClientData,
		saveSignupStep,
		submitSignupStep,
	}
)( localize( UserStep ) );
