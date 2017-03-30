/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import NpsSurvey from 'blocks/nps-survey';
import { showNpsSurveyNoticeIfEligible, setNpsSurveyDialogShowing } from 'state/ui/nps-survey-notice/actions';
import { isNpsSurveyDialogShowing } from 'state/ui/nps-survey-notice/selectors';
import { submitNpsSurveyWithNoScore } from 'state/nps-survey/actions';
import {
	hasAnsweredNpsSurvey,
	hasAnsweredNpsSurveyWithNoScore,
} from 'state/nps-survey/selectors';

class NpsSurveyNotice extends Component {
	handleDialogClose = () => {
		if ( ! this.props.hasAnswered && ! this.props.hasAnsweredWithNoScore ) {
			// the dialog was dismised by clicking outside it
			// and the survey was never answered, so track it
			this.props.submitNpsSurveyWithNoScore();
		}

		this.props.setNpsSurveyDialogShowing( false );
	}

	componentDidMount() {
		// wait a little bit before showing the notice, so that
		// (1) the user gets a chance to look briefly at the uncluttered screen, and
		// (2) the user notices the notice more, since it will cause a change to the
		//     screen they are already looking at
		setTimeout( this.props.showNpsSurveyNoticeIfEligible, 3000 );
	}

	render() {
		return (
			<Dialog isVisible={ this.props.isNpsSurveyDialogShowing } onClose={ this.handleDialogClose }>
				<NpsSurvey
					name="calypso-global-notice-radio-buttons-v1"
					onClose={ this.handleDialogClose }
				/>
			</Dialog>
		);
	}
}

const mapStateToProps = ( state ) => {
	return {
		isNpsSurveyDialogShowing: isNpsSurveyDialogShowing( state ),
		hasAnswered: hasAnsweredNpsSurvey( state ),
		hasAnsweredWithNoScore: hasAnsweredNpsSurveyWithNoScore( state ),
	};
};

export default connect(
	mapStateToProps,
	{ showNpsSurveyNoticeIfEligible, setNpsSurveyDialogShowing, submitNpsSurveyWithNoScore }
)( NpsSurveyNotice );
