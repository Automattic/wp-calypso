/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import MultipleChoiceQuestion from 'calypso/components/multiple-choice-question';
import { recordTracksEvent } from 'calypso/state/analytics/actions';

class GSuiteCancellationSurvey extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_survey_view' );
	}

	render() {
		const {
			disabled,
			onSurveyAnswerChange,
			surveyAnswerId,
			surveyAnswerText,
			translate,
		} = this.props;
		return (
			<MultipleChoiceQuestion
				answers={ [
					{
						id: 'too-expensive',
						answerText: translate( "It's too expensive." ),
						textInput: true,
						textInputPrompt: translate( 'How can we improve G Suite?' ),
					},
					{
						id: 'do-not-need-it',
						answerText: translate( "I don't need it." ),
						textInput: true,
						textInputPrompt: translate( 'What are we missing that you need?' ),
					},
					{
						id: 'purchased-by-mistake',
						answerText: translate( 'I purchased it by mistake.' ),
					},
					{
						id: 'it-did-not-work',
						answerText: translate( 'I was unable to activate or use it.' ),
						textInput: true,
						textInputPrompt: translate( 'Where did you run into problems?' ),
					},
					{
						id: 'another-reason',
						answerText: translate( 'Another reason…' ),
						textInput: true,
						doNotShuffle: true,
					},
				] }
				question={ translate( 'Please tell us why you are cancelling G Suite:' ) }
				onAnswerChange={ onSurveyAnswerChange }
				disabled={ disabled }
				selectedAnswerId={ surveyAnswerId }
				selectedAnswerText={ surveyAnswerText }
			/>
		);
	}
}

GSuiteCancellationSurvey.propTypes = {
	disabled: PropTypes.bool.isRequired,
	onSurveyAnswerChange: PropTypes.func.isRequired,
	translate: PropTypes.func.isRequired,
	surveyAnswerId: PropTypes.string,
	surveyAnswerText: PropTypes.string,
};

export default connect( null, {
	recordTracksEvent,
} )( localize( GSuiteCancellationSurvey ) );
