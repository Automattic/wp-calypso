/** @format */

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
import Button from 'components/button';
import MultipleChoiceQuestion from 'components/multiple-choice-question';
import { recordTracksEvent } from 'state/analytics/actions';

class GSuiteCancellationSurvey extends Component {
	componentDidMount() {
		this.props.recordTracksEvent( 'calypso_purchases_gsuite_remove_purchase_survey_view' );
	}

	render() {
		const { disabled, onSurveyAnswerChange, translate } = this.props;
		return (
			<div className="gsuite-cancel-purchase-dialog__survey">
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
							answerText: translate( "It didn't work." ),
							children: <Button primary>{ translate( 'Get Help Now' ) }</Button>,
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
				/>
			</div>
		);
	}
}

GSuiteCancellationSurvey.propTypes = {
	disabled: PropTypes.bool,
	onSurveyAnswerChange: PropTypes.func.isRequired,
	translate: PropTypes.func,
};

GSuiteCancellationSurvey.defaultProps = {
	disabled: false,
};

export default connect(
	null,
	{
		recordTracksEvent,
	}
)( localize( GSuiteCancellationSurvey ) );
