/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';

class WelcomeStep extends Component {
	state = {
		form: null,
		submitting: false
	};

	handleSubmit = ( event ) => {
		event.preventDefault();

		const {
			goToNextStep,
			stepName,
			translate,
		} = this.props;

		const timestamp = ( new Date() ).getTime();
		const noise = Math.random().toString( 36 ).substring( 2, 10 );
		const site = `site${ timestamp }${ noise }`;

		SignupActions.submitSignupStep( {
			processingMessage: translate( 'Setting up your site' ),
			stepName: stepName,
			site,
		} );

		goToNextStep();
	}

	renderContent() {
		const { translate } = this.props;
		const buttonClass = 'button is-primary';
		return (
			<div className="welcome__content">
				<button className={ buttonClass } onClick={ this.handleSubmit }>
					{ translate( 'Create your account' ) }
				</button>
			</div>
		);
	}

	render() {
		const {
			flowName,
			positionInFlow,
			signupProgress,
			stepName,
			translate,
		} = this.props;

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ translate( 'Welcome to WordPress.com' ) }
				subHeaderText={ translate( 'We\'ve partnered with Rebrand Cities to get businesses online. Get started today.' ) }
				signupProgress={ signupProgress }
				stepContent={ this.renderContent() } />
		);
	}
}

export default localize( WelcomeStep );
