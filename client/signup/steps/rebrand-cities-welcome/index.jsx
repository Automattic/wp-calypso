/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { generateUniqueRebrandCitiesSiteUrl } from 'lib/rebrand-cities';
import SignupActions from 'lib/signup/actions';
import StepWrapper from 'signup/step-wrapper';

class RebrandCitiesWelcomeStep extends Component {
	handleSubmit = ( event ) => {
		event.preventDefault();

		const {
			goToNextStep,
			stepName,
			stepSectionName,
			translate,
		} = this.props;

		SignupActions.submitSignupStep(
			{
				isPurchasingItem: false,
				processingMessage: translate( 'Setting up your site' ),
				siteUrl: generateUniqueRebrandCitiesSiteUrl(),
				stepName,
				stepSectionName,
			}
		);

		goToNextStep();
	}

	renderContent() {
		const { translate } = this.props;
		const buttonClass = 'button is-primary';
		return (
			<button className={ buttonClass } onClick={ this.handleSubmit }>
				{ translate( 'Create your account' ) }
			</button>
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
			<div className="rebrand-cities-welcome">
				<div className="rebrand-cities-welcome__illustration-wrapper">
					<div className="rebrand-cities-welcome__illustration"></div>
				</div>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ translate( 'Connect your business to the online world' ) }
					subHeaderText={ translate( 'Rebrand Cities and WordPress.com have partnered ' +
						'to get your business online. We’ll need you to create a WordPress.com ' +
						'account to get you started.' ) }
					signupProgress={ signupProgress }
					stepContent={ this.renderContent() } />
			</div>
		);
	}
}

export default localize( RebrandCitiesWelcomeStep );
