import config from '@automattic/calypso-config';
import { isMobile } from '@automattic/viewport';
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SignupForm from 'calypso/blocks/signup-form';
import { initGoogleRecaptcha, recordGoogleRecaptchaAction } from 'calypso/lib/analytics/recaptcha';
import detectHistoryNavigation from 'calypso/lib/detect-history-navigation';
import { getSocialServiceFromClientId } from 'calypso/lib/login';
import { login } from 'calypso/lib/paths';
import flows from 'calypso/signup/config/flows';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getNextStepName, getPreviousStepName, getStepUrl } from 'calypso/signup/utils';
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
export class UserStepPaidMedia extends Component {
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

	getSubHeaderText() {
		const {
			oauth2Client,
			positionInFlow,
			translate,
			wccomFrom,
			isReskinned,
			sectionName,
			from,
			locale,
		} = this.props;

		let subHeaderText = this.props.subHeaderText;
		const loginUrl = login( {
			isJetpack: 'jetpack-connect' === sectionName,
			from,
			redirectTo: getRedirectToAfterLoginUrl( this.props ),
			locale,
			oauth2ClientId: oauth2Client?.id,
			wccomFrom,
			isWhiteLogin: isReskinned,
			signupUrl: window.location.pathname + window.location.search,
		} );

		if ( isReskinned && 0 === positionInFlow ) {
			subHeaderText = translate(
				'First, create your WordPress.com account. Have an account? {{a}}Log in{{/a}}',
				{
					components: { a: <a href={ loginUrl } rel="noopener noreferrer" /> },
				}
			);
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

		this.props.recordTracksEvent( 'calypso_signup_user_step_submit', analyticsData );

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
	 * @param {object} userData     (Optional) extra user information that can be used to create a new account
	 */
	handleSocialResponse = ( service, access_token, id_token = null, userData = null ) => {
		const { translate, initialContext } = this.props;

		if ( ! isOauth2RedirectValid( initialContext?.query?.oauth2_redirect ) ) {
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
			queryArgs: initialContext?.query || {},
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
		const { headerText } = this.props;

		return headerText;
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
		const { isReskinned } = this.props;
		let socialService;
		let socialServiceResponse;
		const isSocialSignupEnabled = this.props.isSocialSignupEnabled;

		const hashObject = this.props.initialContext && this.props.initialContext.hash;
		if ( isSocialSignupEnabled && hashObject.length !== 0 ) {
			const clientId = hashObject.client_id;
			socialService = getSocialServiceFromClientId( clientId );
			if ( socialService ) {
				socialServiceResponse = hashObject;
			}
		}
		const trimmedProps = ( ( {
			oauth2Signup,
			initialContext,
			flowName,
			stepName,
			userLoggedIn,
		} ) => ( { oauth2Signup, initialContext, flowName, stepName, userLoggedIn } ) )( this.props );

		return (
			<>
				<SignupForm
					redirectToAfterLoginUrl={ getRedirectToAfterLoginUrl( trimmedProps ) }
					disabled={ this.userCreationStarted() }
					submitting={ this.userCreationStarted() }
					save={ this.save }
					submitForm={ this.submitForm }
					submitButtonText={ this.submitButtonText() }
					suggestedUsername={ this.props.suggestedUsername }
					handleSocialResponse={ this.handleSocialResponse }
					isPasswordless={ isMobile() }
					queryArgs={ this.props.initialContext?.query || {} }
					isSocialSignupEnabled={ isSocialSignupEnabled }
					socialService={ socialService }
					socialServiceResponse={ socialServiceResponse }
					recaptchaClientId={ this.state.recaptchaClientId }
					horizontal={ isReskinned }
					isReskinned={ isReskinned }
					shouldDisplayUserExistsError={ false }
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
				subHeaderText={ this.getSubHeaderText() }
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
		// test this with wccomFrom: getCurrentQueryArguments( state )?.[ 'wccom-from' ],
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
)( localize( UserStepPaidMedia ) );
