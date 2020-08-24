/**
 * External dependencies
 */

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { translate } from 'i18n-calypso';
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { NpsSurvey } from '../';
import {
	isNpsSurveySubmitted,
	isNpsSurveySubmitFailure,
	hasAnsweredNpsSurvey,
	hasAnsweredNpsSurveyWithNoScore,
	getNpsSurveyName,
	getNpsSurveyScore,
	getNpsSurveyFeedback,
} from 'state/nps-survey/selectors';
import {
	submitNpsSurvey,
	submitNpsSurveyWithNoScore,
	sendNpsSurveyFeedback,
} from 'state/nps-survey/actions';
import { successNotice } from 'state/notices/actions';

class NpsSurveyExample extends PureComponent {
	state = {
		isClosed: false,
		hasAvailableConciergeSession: false,
		isBusinessUser: false,
	};

	handleClose = ( afterClose ) => {
		this.setState( {
			isClosed: true,
		} );
		afterClose();
	};

	toggleBusinessUser = ( event ) => {
		this.setState( { isBusinessUser: event.target.checked } );
	};

	toggleConciergeSessionAvailability = ( event ) => {
		this.setState( { hasAvailableConciergeSession: event.target.checked } );
	};

	renderOptions() {
		return (
			<div style={ { marginTop: '10px' } }>
				<label style={ { display: 'block' } }>
					<input type="checkbox" onClick={ this.toggleBusinessUser } />
					The user subscribes the Business plan.
				</label>
				<label style={ { display: 'block' } }>
					<input type="checkbox" onClick={ this.toggleConciergeSessionAvailability } />
					The user is available for concierge sessions.
				</label>
			</div>
		);
	}

	render() {
		return (
			<div>
				{ ! this.state.isClosed && (
					<NpsSurvey
						name="api-valid-test-survey"
						onClose={ this.handleClose }
						translate={ translate }
						hasAnswered={ this.props.hasAnswered }
						submitNpsSurvey={ this.props.submitNpsSurvey }
						submitNpsSurveyWithNoScore={ this.props.submitNpsSurveyWithNoScore }
						sendNpsSurveyFeedback={ this.props.sendNpsSurveyFeedback }
						successNotice={ this.props.successNotice }
						isBusinessUser={ this.state.isBusinessUser }
						hasAvailableConciergeSession={ this.state.hasAvailableConciergeSession }
						recordTracksEvent={ noop }
					/>
				) }
				{ ! this.state.isClosed && this.renderOptions() }
				{ this.state.isClosed && this.props.hasAnswered && (
					<div>
						User closed survey after submitting:
						<ul>
							<li>Survey name: { this.props.surveyName }</li>
							<li>Score: { this.props.surveyScore }</li>
							<li>Contextual feedback: { this.props.surveyFeedback }</li>
						</ul>
					</div>
				) }
				{ this.state.isClosed && this.props.hasAnsweredWithNoScore && (
					<div>User dismissed survey without submitting.</div>
				) }
				{ this.state.isClosed && this.props.isSubmitFailure && <div>Error submitting survey.</div> }
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		isSubmitted: isNpsSurveySubmitted( state ),
		isSubmitFailure: isNpsSurveySubmitFailure( state ),
		hasAnswered: hasAnsweredNpsSurvey( state ),
		hasAnsweredWithNoScore: hasAnsweredNpsSurveyWithNoScore( state ),
		surveyName: getNpsSurveyName( state ),
		surveyScore: getNpsSurveyScore( state ),
		surveyFeedback: getNpsSurveyFeedback( state ),
	};
};

const mapDispatchToProp = {
	submitNpsSurvey,
	submitNpsSurveyWithNoScore,
	sendNpsSurveyFeedback,
	successNotice,
};

const ConnectedNpsSurveyExample = connect( mapStateToProps, mapDispatchToProp )( NpsSurveyExample );

ConnectedNpsSurveyExample.displayName = 'NpsSurvey';

export default ConnectedNpsSurveyExample;
