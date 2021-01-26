/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import i18n, { localize } from 'i18n-calypso';
import { identity, includes, isEmpty, omit, get } from 'lodash';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import {
	isCrowdsignalOAuth2Client,
	isWooOAuth2Client,
	isJetpackCloudOAuth2Client,
} from 'calypso/lib/oauth2-clients';
import StepWrapper from 'calypso/signup/step-wrapper';
import flows from 'calypso/signup/config/flows';
import SignupForm from 'calypso/blocks/signup-form';
import {
	getFlowSteps,
	getNextStepName,
	getPreviousStepName,
	getStepUrl,
} from 'calypso/signup/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { fetchOAuth2ClientData } from 'calypso/state/oauth2-clients/actions';
import { getCurrentOAuth2Client } from 'calypso/state/oauth2-clients/ui/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import { getSuggestedUsername } from 'calypso/state/signup/optional-dependencies/selectors';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { WPCC } from 'calypso/lib/url/support';
import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import config from '@automattic/calypso-config';
import AsyncLoad from 'calypso/components/async-load';
import WooCommerceConnectCartHeader from 'calypso/extensions/woocommerce/components/woocommerce-connect-cart-header';
import { getSocialServiceFromClientId } from 'calypso/lib/login';
import { getABTestVariation } from 'calypso/lib/abtest';
import JetpackLogo from 'calypso/components/jetpack-logo';

/**
 * Style dependencies
 */
import './style.scss';

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
			this.props.locale !== nextProps.locale ||
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

		i18n.on( 'change', this.handleI18nChange );
	}

	componentWillUnmount() {
		i18n.off( 'change', this.handleI18nChange );
	}

	handleI18nChange = () => {
		this.setSubHeaderText( this.props );
	};

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

	save = ( form ) => {
		this.props.saveSignupStep( {
			stepName: this.props.stepName,
			form,
		} );
	};

	isOauth2RedirectValid( oauth2Redirect ) {
		try {
			const url = new URL( oauth2Redirect );
			return url.host === 'public-api.wordpress.com';
		} catch {
			return false;
		}
	}

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
		const { translate } = this.props;

		if ( ! this.isOauth2RedirectValid( this.props.initialContext.query.oauth2_redirect ) ) {
			this.props.errorNotice(
				translate( 'An unexpected error occurred. Please try again later.' )
			);
			return;
		}

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
										require="calypso/components/jetpack-header/woocommerce"
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

		if ( isJetpackCloudOAuth2Client( oauth2Client ) ) {
			return (
				<div className={ classNames( 'signup-form__jetpack-cloud-wrapper' ) }>
					<JetpackLogo full={ false } size={ 60 } />
					<h3>{ translate( 'Sign up to Jetpack.com with a WordPress.com account.' ) }</h3>
				</div>
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
			this.props.initialContext.query.oauth2_redirect &&
			this.isOauth2RedirectValid( this.props.initialContext.query.oauth2_redirect )
		) {
			return this.props.initialContext.query.oauth2_redirect;
		}

		const stepAfterRedirect =
			getNextStepName( this.props.flowName, this.props.stepName ) ||
			getPreviousStepName( this.props.flowName, this.props.stepName );
		const queryArgs = new URLSearchParams( this.props?.initialContext?.query );
		const queryArgsString = queryArgs.toString() ? '?' + queryArgs.toString() : '';

		return (
			this.originUrl() + getStepUrl( this.props.flowName, stepAfterRedirect ) + queryArgsString
		);
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
		const { oauth2Client, wccomFrom, flowName } = this.props;
		let socialService;
		let socialServiceResponse;
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

		const isReskinned =
			'onboarding' === flowName && 'reskinned' === getABTestVariation( 'reskinSignupFlow' );

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
					horizontal={ isReskinned }
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
		errorNotice,
		recordTracksEvent,
		fetchOAuth2ClientData,
		saveSignupStep,
		submitSignupStep,
	}
)( localize( UserStep ) );
