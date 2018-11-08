/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import { generateUniqueRebrandCitiesSiteUrl } from 'lib/rebrand-cities';
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';

/**
 * Style dependencies
 */
import './style.scss';

class RebrandCitiesWelcomeStep extends Component {
	handleSubmit = siteTitle => {
		const { goToNextStep, stepName, stepSectionName, translate } = this.props;

		this.props.setSiteTitle( siteTitle );

		SignupActions.submitSignupStep( {
			isPurchasingItem: false,
			processingMessage: translate( 'Setting up your site' ),
			siteUrl: generateUniqueRebrandCitiesSiteUrl(),
			stepName,
			stepSectionName,
		} );

		goToNextStep();
	};

	renderContent() {
		const { translate } = this.props;
		return (
			<div className="rebrand-cities-welcome__site-title-field">
				<FormTextInputWithAction
					action={ translate( 'Create account' ) }
					placeholder={ translate( 'Enter your business name' ) }
					onAction={ this.handleSubmit }
				/>
			</div>
		);
	}

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
			<div className="rebrand-cities-welcome">
				<div className="rebrand-cities-welcome__illustration-wrapper">
					<div className="rebrand-cities-welcome__illustration" />
				</div>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ translate( 'Connect your business to the online world' ) }
					subHeaderText={ translate(
						'Rebrand Cities and WordPress.com have partnered ' +
							'to get your business online. We’ll need you to create a WordPress.com ' +
							'account to get you started.'
					) }
					signupProgress={ signupProgress }
					stepContent={ this.renderContent() }
				/>
			</div>
		);
	}
}

export default connect(
	null,
	{ setSiteTitle }
)( localize( RebrandCitiesWelcomeStep ) );
