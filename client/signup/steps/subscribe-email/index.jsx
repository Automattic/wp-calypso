import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import SubscribeEmailStepContent from './content';
import './style.scss';

class SubscribeEmailStep extends Component {
	handleButtonClick = () => {
		// this.props.recordTracksEvent( 'calypso_signup_reader_landing_cta' );
		// this.props.submitSignupStep( { stepName: this.props.stepName } );
		// this.props.goToNextStep();
	};

	render() {
		const { flowName, positionInFlow, stepName } = this.props;
		// const { flowName, positionInFlow, stepName, translate } = this.props;

		return (
			<div className="reader-landing">
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					// headerText={ translate( 'Keep track of all your favorite sites in one place' ) }
					// subHeaderText={ translate(
					// 	'Read posts from all the sites you follow, find great new reads, and stay up-to-date on comments and replies in one convenient place: the WordPress.com Reader.'
					// ) }
					stepContent={ <SubscribeEmailStepContent onButtonClick={ this.handleButtonClick } /> }
				/>
			</div>
		);
	}
}

export default connect( null, { recordTracksEvent, submitSignupStep } )(
	localize( SubscribeEmailStep )
);
