/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import NpsSurvey from '../';
import {
	isNpsSurveySubmitted,
	isNpsSurveySubmitFailure,
	hasAnsweredNpsSurvey,
	hasAnsweredNpsSurveyWithNoScore,
	getNpsSurveyName,
	getNpsSurveyScore,
} from 'state/nps-survey/selectors';

class NpsSurveyExample extends PureComponent {
	static displayName = 'NpsSurvey';

	state = {
		isClosed: false,
	};

	handleClose = ( afterClose ) => {
		this.setState( {
			isClosed: true,
		} );
		afterClose();
	}

	render() {
		return (
			<div>
				{ ! this.state.isClosed &&
					<NpsSurvey
						name="api-valid-test-survey"
						onClose={ this.handleClose }
					/>
				}
				{ this.state.isClosed && this.props.hasAnswered &&
					<div>
						User closed survey after submitting:
						<ul>
							<li>Survey name: { this.props.surveyName }</li>
							<li>Score: { this.props.surveyScore }</li>
						</ul>
					</div>
				}
				{ this.state.isClosed && this.props.hasAnsweredWithNoScore &&
					<div>
						User dismissed survey without submitting.
					</div>
				}
				{ this.state.isClosed && this.props.isSubmitFailure &&
					<div>
						Error submitting survey.
					</div>
				}
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
	};
};

const ConnectedNpsSurveyExample = connect(
	mapStateToProps,
)( NpsSurveyExample );

ConnectedNpsSurveyExample.displayName = NpsSurveyExample.displayName;

export default ConnectedNpsSurveyExample;
