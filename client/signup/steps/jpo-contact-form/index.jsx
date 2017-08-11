/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';
import Button from 'components/button';
import { translate } from 'i18n-calypso';

import { setJPOContactForm } from 'state/signup/steps/jpo-contact-form/actions';

import ContactUsGraphic from './contact-us-graphic';

const JPOContactFormStep = React.createClass( {
	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOContactForm: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	},

	onSelect() {
		const jpoContactForm = true;

		this.props.setJPOContactForm( jpoContactForm );

		SignupActions.submitSignupStep( {
			processingMessage: translate( 'Setting up your site' ),
			stepName: this.props.stepName,
			jpoContactForm
		}, [], { jpoContactForm } );

		this.props.goToNextStep();
	},

	skipStep() {
		this.props.goToNextStep();
	},

	renderStepContent() {
		return (
			<div className="jpo__contact-form-wrapper">
				<Card>
					<ContactUsGraphic />
					<Button onClick={ this.onSelect }>Add a contact form</Button>
					<div className="jpo__contact-form-description">Not sure? You can skip this step and add a contact form later.</div>
				</Card>
			</div>
		);
	},

	render() {
		const headerText = translate( "Let's shape %s.", {
			args: get( this.props.signupProgress[ 0 ], [ 'jpoSiteTitle', 'siteTitle' ], false ) || translate( 'your new site' )
		} );
		const subHeaderText = translate( 'Would you like to get started with a Contact Us page?' );

		return (
			<div>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ headerText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ subHeaderText }
					signupProgress={ this.props.signupProgress }
					stepContent={ this.renderStepContent() }
					goToNextStep={ this.skipStep }
				/>
			</div>
		);
	}
} );

export default connect(
	null,
	{ setJPOContactForm }
)( JPOContactFormStep );