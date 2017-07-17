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
import Button from 'components/button';
import { translate } from 'i18n-calypso';

import { setJPOSummary } from 'state/signup/steps/jpo-summary/actions';

const JPOSummaryStep = React.createClass( {
	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOSummary: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	},

	skipStep() {
		this.props.goToNextStep();
	},

	renderStepContent() {
		return (
			<div className="jpo__summary-wrapper">
				<table>
					<tbody>
						<tr>
							<td>
								<div className="jpo__summary-col-header">Steps you've completed:</div>
								<ul>
									<li>Site Title & Description</li>
									<li>Type of Site</li>
									<li>Type of Homepage</li>
									<li>Contact Us Form</li>
									<li>Connection to Jetpack</li>
								</ul>
							</td>
							<td>
								<div className="jpo__summary-col-header">Configure more of your site:</div>
								<ul>
									<li>Choose a Theme</li>
									<li>Add a Site Address</li>
									<li>Add a Store</li>
									<li>Start a Blog</li>
								</ul>
							</td>
						</tr>
					</tbody>
				</table>
				<div>
					<Button primary>Complete Onboarding</Button>
				</div>
			</div>
		);
	},

	render() {
		const headerText = translate( 'Congratulations! Site name is on its way.' );
		const subHeaderText = translate( 'You enabled Jetpack and unlocked dozens of website-bolstering features. Continue preparing yoru site below.' );

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
	{ setJPOSummary }
)( JPOSummaryStep );