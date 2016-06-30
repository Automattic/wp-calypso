/**
 * External dependencies
 */
import React from 'react';
import analytics from 'lib/analytics';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupForm from 'components/signup-form';
import signupUtils from 'signup/utils';
import SignupActions from 'lib/signup/actions';
import { abtest } from 'lib/abtest';
import config from 'config';

export default React.createClass( {

	displayName: 'User',

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.step && 'invalid' === nextProps.step.status ) {
			this.setState( { submitting: false } );
		}

		if ( this.props.flowName !== nextProps.flowName || this.props.subHeaderText !== nextProps.subHeaderText ) {
			this.setSubHeaderText( nextProps );
		}
	},

	componentWillMount() {
		this.setSubHeaderText( this.props );
	},

	setSubHeaderText( props ) {
		let subHeaderText = props.subHeaderText;

		/**
		 * Update the step sub-header if they only want to create an account, without a site.
		 */
		if ( 1 === signupUtils.getFlowSteps( props.flowName ).length ) {
			subHeaderText = this.translate( 'Welcome to the wonderful WordPress.com community' );
		}

		this.setState( { subHeaderText: subHeaderText } );
	},

	save( form ) {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
			form: form
		} );
	},

	submitForm( form, userData, analyticsData ) {
		let flowName = this.props.flowName,
			queryArgs = {};

		if ( this.props.queryObject && this.props.queryObject.jetpack_redirect ) {
			queryArgs.jetpackRedirect = this.props.queryObject.jetpack_redirect;
		}

		if ( config.isEnabled( 'reader/start' ) ) {
			// User is participating in Reader Cold Start
			if ( abtest( 'coldStartReader' ) === 'noEmailColdStart' ) {
				userData.follow_default_blogs = false;
				userData.subscription_delivery_email_default = 'never';
				userData.is_new_reader = true;
			}
		}

		const formWithoutPassword = Object.assign( {}, form, {
			password: Object.assign( {}, form.password, { value: '' } )
		} );

		analytics.tracks.recordEvent( 'calypso_signup_user_step_submit', analyticsData );

		SignupActions.submitSignupStep( {
			processingMessage: this.translate( 'Creating your account' ),
			flowName,
			userData,
			stepName: this.props.stepName,
			form: formWithoutPassword,
			queryArgs
		} );

		this.props.goToNextStep();
	},

	userCreationComplete() {
		return this.props.step && 'completed' === this.props.step.status;
	},

	userCreationPending() {
		return this.props.step && 'pending' === this.props.step.status;
	},

	userCreationStarted() {
		return this.userCreationPending() || this.userCreationComplete();
	},

	getRedirectToAfterLoginUrl() {
		const stepAfterRedirect = signupUtils.getNextStepName( this.props.flowName, this.props.stepName ) ||
			signupUtils.getPreviousStepName( this.props.flowName, this.props.stepName );
		return this.originUrl() + signupUtils.getStepUrl(
				this.props.flowName,
				stepAfterRedirect
			);
	},

	originUrl() {
		return window.location.protocol + '//' + window.location.hostname +
			( window.location.port ? ':' + window.location.port : '' );
	},

	submitButtonText() {
		if ( this.userCreationPending() ) {
			return this.translate( 'Creating Your Account…' );
		}

		if ( this.userCreationComplete() ) {
			return this.translate( 'Account created - Go to next step' );
		}

		return this.translate( 'Create My Account' );
	},

	renderSignupForm() {
		return (
			<SignupForm
				{ ...this.props }
				getRedirectToAfterLoginUrl={ this.getRedirectToAfterLoginUrl() }
				disabled={ this.userCreationStarted() }
				submitting={ this.userCreationStarted() }
				save={ this.save }
				submitForm={ this.submitForm }
				submitButtonText={ this.submitButtonText() }
			/>
		);
	},

	render() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				headerText={ this.props.headerText }
				subHeaderText={ this.state.subHeaderText }
				positionInFlow={ this.props.positionInFlow }
				fallbackHeaderText={ this.translate( 'Create your account.' ) }
				signupProgressStore={ this.props.signupProgressStore }
				stepContent={ this.renderSignupForm() }
			/>
		);
	}
} );
