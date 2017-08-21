/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { identity, omit, get } from 'lodash';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupForm from 'components/signup-form';
import signupUtils from 'signup/utils';
import SignupActions from 'lib/signup/actions';
import { getSuggestedUsername } from 'state/signup/optional-dependencies/selectors';

import { recordTracksEvent } from 'state/analytics/actions';

export class UserStep extends Component {
	static propTypes = {
		flowName: PropTypes.string,
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
		let subHeaderText = props.subHeaderText;

		if ( props.flowName === 'social' ) {
			// Hides sub header for this particular flow
			subHeaderText = '';
		} else if ( 1 === signupUtils.getFlowSteps( props.flowName ).length ) {
			// Displays specific sub header if users only want to create an account, without a site
			subHeaderText = this.props.translate( 'Welcome to the wonderful WordPress.com community' );
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
		const dependencies = {};
		if ( this.props.oauth2Signup ) {
			dependencies.oauth2_client_id = data.queryArgs.oauth2_client_id;
		}

		SignupActions.submitSignupStep( {
			processingMessage: this.props.translate( 'Creating your account' ),
			flowName: this.props.flowName,
			stepName: this.props.stepName,
			...data
		}, null, dependencies );

		this.props.goToNextStep();
	};

	submitForm = ( form, userData, analyticsData ) => {
		const queryArgs = {
			jetpackRedirect: get( this.props, 'queryObject.jetpack_redirect' )
		};

		queryArgs.oauth2_client_id = get( this.props, 'queryObject.oauth2_client_id' );

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
			queryArgs
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

	getRedirectToAfterLoginUrl() {
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
				getRedirectToAfterLoginUrl={ this.getRedirectToAfterLoginUrl() }
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
				headerText={ this.props.headerText }
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
		suggestedUsername: getSuggestedUsername( state )
	} ),
	{
		recordTracksEvent
	}
)( localize( UserStep ) );
