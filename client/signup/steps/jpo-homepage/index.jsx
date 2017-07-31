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
import Button from 'components/button';
import { translate } from 'i18n-calypso';

import { setJPOHomepage } from 'state/signup/steps/jpo-homepage/actions';

const JPOHomepageStep = React.createClass( {
	propTypes: {
		flowName: PropTypes.string,
		goToNextStep: PropTypes.func.isRequired,
		positionInFlow: PropTypes.number,
		setJPOHomepage: PropTypes.func.isRequired,
		signupProgress: PropTypes.array,
		stepName: PropTypes.string,
	},

	skipStep() {
		this.props.goToNextStep();
	},

	renderStepContent() {
		return (
			<div className="jpo__homepage-wrapper">
				<div className="jpo__homepage-row">
					<Card>
						<Button>Recent news or updates</Button>
						<div className="jpo__homepage-description">We can pull the latest information into your homepage for you.</div>
					</Card>
					<Card>
						<Button>A static welcome page</Button>
						<div className="jpo__homepage-description">Have your homepage stay the same as time goes on.</div>
					</Card>
				</div>
			</div>
		);
	},

	render() {
		const headerText = translate( 'Let\'s shape site name.' );
		const subHeaderText = translate( 'What should visitors see on your homepage?' );

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
	{ setJPOHomepage }
)( JPOHomepageStep );