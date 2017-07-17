/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import Card from 'components/card';
import FormLabel from 'components/forms/form-label';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import Button from 'components/button';
import { translate } from 'i18n-calypso';

import { setJPOSiteTitle } from 'state/signup/steps/jpo-site-title/actions';
import { getJPOSiteTitle } from 'state/signup/steps/jpo-site-title/selectors';

const JPOSiteTitleStep = React.createClass( {
	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSiteTitle: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	},

	submitStep() {
		this.props.goToNextStep();
	},

	skipStep() {
		this.props.goToNextStep();
	},

	renderStepContent() {
		return (
			<Card className="jpo__site-title-card">
				<FormLabel>{ translate( 'Site Title' ) }</FormLabel>
				<FormTextInput className="jpo__site-title-input" />
				<FormLabel>{ translate( 'Site Description' ) }</FormLabel>
				<FormTextarea className="jpo__site-description-input" />
				<Button primary onClick={ this.submitStep } className="jpo__site-title-submit">{ translate( 'Next Step' ) }</Button>
			</Card>
		);
	},

	render() {
		const headerText = translate( 'Let\'s get started.' );
		const subHeaderText = translate( 'First up, what would you like to name your site and have as its public description?' );

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
	{ setJPOSiteTitle }
)( JPOSiteTitleStep );