/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity, omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import SignupForm from 'components/signup-form';
import { isWooOAuth2Client } from 'lib/oauth2-clients';
import SignupActions from 'lib/signup/actions';
import support from 'lib/url/support';
import StepWrapper from 'signup/step-wrapper';
import signupUtils from 'signup/utils';
import { recordTracksEvent } from 'state/analytics/actions';
import { getSuggestedUsername } from 'state/signup/optional-dependencies/selectors';
import { getCurrentOAuth2Client } from 'state/ui/oauth2-clients/selectors';

export class UserStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
		oauth2Client: PropTypes.object,
		translate: PropTypes.func,
		subHeaderText: PropTypes.string,
		isSocialSignupEnabled: PropTypes.bool,
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

		if ( this.props.flowName !== nextProps.flowName || this.props.subHeaderText !== nextProps.subHeaderText ) {
			this.setSubHeaderText( nextProps );
		}
	}

	componentWillMount() {
		this.setSubHeaderText( this.props );
	}

	setSubHeaderText( props ) {
		const { flowName, oauth2Client, translate } = props;

		let subHeaderText = props.subHeaderText;

		if ( flowName === 'wpcc' && oauth2Client ) {
			if ( isWooOAuth2Client( oauth2Client ) ) {
				subHeaderText = translate( '{{a}}Learn more about the benefits{{/a}}', {
					components: {
						a: <a href="https://woocommerce.com/2017/01/woocommerce-requires-wordpress-account/"
							target="_blank" rel="noopener noreferrer" />,
					},
					comment: 'Link displayed on the Signup page to users willing to sign up for WooCommerce via WordPress.com'
				} );
			} else {
				subHeaderText = translate( 'Not sure what this is all about? {{a}}We can help clear that up for you.{{/a}}', {
					components: {
						a: <a href={ support.WPCC } target="_blank" />,
					},
					comment: 'Text displayed on the Signup page to users willing to sign up for an app via WordPress.com'
				} );
			}
		} else if ( 1 === signupUtils.getFlowSteps( flowName ).length ) {
			// Displays specific sub header if users only want to create an account, without a site
			subHeaderText = translate( 'Welcome to the wonderful WordPress.com community' );
		}

		this.setState( { subHeaderText } );
	}

	save = ( form ) => {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
			form: form
		} );
	};

	submit = ( data ) => {
		const { flowName, stepName, oauth2Signup, translate } = this.props;
		const dependencies = {};

		if ( oauth2Signup ) {
			dependencies.oauth2_client_id = data.queryArgs.oauth2_client_id;
			dependencies.oauth2_redirect = data.queryArgs.oauth2_redirect;
		}

		SignupActions.submitSignupStep( {
			processingMessage: translate( 'Creating your account' ),
			flowName,
			stepName,
			oauth2Signup,
			...data
		}, null, dependencies );

		this.props.goToNextStep();
	};

	submitForm = ( form, userData, analyticsData ) => {
		const formWithoutPassword = {
			...form,
			password: {
				...form.password,
				value: ''
			}
		};

		this.props.recordTracksEvent( 'calypso_signup_user_step_submit', analyticsData );

		this.submit( {
			userData,
			form: formWithoutPassword,
			queryArgs: this.props.queryObject || {},
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
		this.submit( { service, access_token, id_token } );
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
				comment: "'clientTitle' is the name of the app that uses WordPress.com Connect (e.g. 'Akismet' or 'VaultPress')"
			} );
		}

		return headerText;
	}

	getRedirectToAfterLoginUrl() {
		if ( this.props.oauth2Signup && this.props.queryObject.oauth2_redirect ) {
			return this.props.queryObject.oauth2_redirect;
		}

		const stepAfterRedirect = signupUtils.getNextStepName( this.props.flowName, this.props.stepName ) ||
			signupUtils.getPreviousStepName( this.props.flowName, this.props.stepName );
		return this.originUrl() + signupUtils.getStepUrl(
				this.props.flowName,
				stepAfterRedirect
			);
	}

	originUrl() {
		return window.location.protocol + '//' + window.location.hostname +
			( window.location.port ? ':' + window.location.port : '' );
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
	( state ) => ( {
		oauth2Client: getCurrentOAuth2Client( state ),
		suggestedUsername: getSuggestedUsername( state ),
	} ),
	{
		recordTracksEvent
	}
)( localize( UserStep ) );
