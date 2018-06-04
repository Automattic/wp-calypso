/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, isEmpty, omit, get } from 'lodash';

/**
 * Internal dependencies
 */
import { isWooOAuth2Client } from 'lib/oauth2-clients';
import StepWrapper from 'signup/step-wrapper';
import SignupForm from 'blocks/signup-form';
import { getFlowSteps, getNextStepName, getPreviousStepName, getStepUrl } from 'signup/utils';
import SignupActions from 'lib/signup/actions';
import { fetchOAuth2ClientData } from 'state/oauth2-clients/actions';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';
import { getSuggestedUsername } from 'state/signup/optional-dependencies/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import { WPCC } from 'lib/url/support';
import config from 'config';

function getSocialServiceFromClientId( clientId ) {
	if ( ! clientId ) {
		return null;
	}

	if ( clientId === config( 'google_oauth_client_id' ) ) {
		return 'google';
	}

	if ( clientId === config( 'facebook_app_id' ) ) {
		return 'facebook';
	}

	return null;
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
		translate: identity,
		suggestedUsername: identity,
		isSocialSignupEnabled: false,
	};

	state = {
		submitting: false,
		subHeaderText: '',
	};

	componentWillReceiveProps( nextProps ) {
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

	componentWillMount() {
		const { oauth2Signup, initialContext } = this.props;
		const clientId = get( initialContext, 'query.oauth2_client_id', null );

		this.setSubHeaderText( this.props );

		if ( oauth2Signup && clientId ) {
			this.props.fetchOAuth2ClientData( clientId );
		}
	}

	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	setSubHeaderText( props ) {
		const { flowName, oauth2Client, translate } = props;

		let subHeaderText = props.subHeaderText;

		if ( flowName === 'wpcc' && oauth2Client ) {
			if ( isWooOAuth2Client( oauth2Client ) ) {
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
			} else {
				subHeaderText = translate(
					'Not sure what this is all about? {{a}}We can help clear that up for you.{{/a}}',
					{
						components: {
							a: <a href={ WPCC } target="_blank" />,
						},
						comment:
							'Text displayed on the Signup page to users willing to sign up for an app via WordPress.com',
					}
				);
			}
		} else if ( 1 === getFlowSteps( flowName ).length ) {
			// Displays specific sub header if users only want to create an account, without a site
			subHeaderText = translate( 'Welcome to the wonderful WordPress.com community' );
		}

		this.setState( { subHeaderText } );
	}

	save = form => {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
			form: form,
		} );
	};

	submit = data => {
		const { flowName, stepName, oauth2Signup, translate } = this.props;
		const dependencies = {};

		if ( oauth2Signup ) {
			dependencies.oauth2_client_id = data.queryArgs.oauth2_client_id;
			dependencies.oauth2_redirect = data.queryArgs.oauth2_redirect;
		}

		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Creating your account' ),
				flowName,
				stepName,
				oauth2Signup,
				...data,
			},
			dependencies
		);

		this.props.goToNextStep();
	};

	submitForm = ( form, userData, analyticsData ) => {
		const formWithoutPassword = {
			...form,
			password: {
				...form.password,
				value: '',
			},
		};

		this.props.recordTracksEvent( 'calypso_signup_user_step_submit', analyticsData );

		this.submit( {
			userData,
			form: formWithoutPassword,
			queryArgs: ( this.props.initialContext && this.props.initialContext.query ) || {},
		} );
	};

	/**
	 * Handle Social service authentication flow result (OAuth2 or OpenID Connect)
	 *
	 * @param {String} service      The name of the social service
	 * @param {String} access_token An OAuth2 acccess token
	 * @param {String} id_token     (Optional) a JWT id_token which contains the signed user info
	 *                              So our server doesn't have to request the user profile on its end.
	 */
	handleSocialResponse = ( service, access_token, id_token = null ) => {
		this.submit( {
			service,
			access_token,
			id_token,
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
		const { flowName, headerText, oauth2Client, translate } = this.props;

		if ( flowName === 'wpcc' && oauth2Client ) {
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

		return translate( 'Continue' );
	}

	renderSignupForm() {
		let socialService, socialServiceResponse;
		const hashObject = this.props.initialContext && this.props.initialContext.hash;
		if ( this.props.isSocialSignupEnabled && ! isEmpty( hashObject ) ) {
			const clientId = hashObject.client_id;
			socialService = getSocialServiceFromClientId( clientId );

			if ( socialService ) {
				socialServiceResponse = hashObject;
			}
		}

		return (
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
				isSocialSignupEnabled={ this.props.isSocialSignupEnabled }
				socialService={ socialService }
				socialServiceResponse={ socialServiceResponse }
			/>
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
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderSignupForm() }
			/>
		);
	}
}

export default connect(
	state => ( {
		oauth2Client: getCurrentOAuth2Client( state ),
		suggestedUsername: getSuggestedUsername( state ),
	} ),
	{
		recordTracksEvent,
		fetchOAuth2ClientData,
	}
)( localize( UserStep ) );
