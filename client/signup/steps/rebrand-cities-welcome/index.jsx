/**
 * External dependencies
 */

import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import StepWrapper from 'signup/step-wrapper';
import { generateUniqueRebrandCitiesSiteUrl } from 'lib/rebrand-cities';
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';
import { setSiteTitle } from 'state/signup/steps/site-title/actions';
import { submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

/**
 * Image dependencies
 */
import rebrandCitiesImage from 'assets/images/illustrations/rebrand-cities-welcome.svg';

class RebrandCitiesWelcomeStep extends Component {
	handleSubmit = siteTitle => {
		const { goToNextStep, stepName, stepSectionName } = this.props;

		this.props.setSiteTitle( siteTitle );

		this.props.submitSignupStep( {
			isPurchasingItem: false,
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
		const { flowName, positionInFlow, stepName, translate } = this.props;

		return (
			<div className="rebrand-cities-welcome">
				<Card className="rebrand-cities-welcome__illustration-wrapper">
					<img className="rebrand-cities-welcome__illustration" src={ rebrandCitiesImage } alt="" />
				</Card>
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
					stepContent={ this.renderContent() }
				/>
			</div>
		);
	}
}

export default connect( null, { setSiteTitle, submitSignupStep } )(
	localize( RebrandCitiesWelcomeStep )
);
