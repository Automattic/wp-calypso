/** @format */

/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import MultipleChoiceQuestion from 'components/multiple-choice-question';
import MultipleChoiceAnswer from 'components/multiple-choice-question/answer';
import MultipleChoiceAnswerTextInput from 'components/multiple-choice-question/answer-text-input';

const GSuiteCancellationSurvey = ( { disabled, onSurveyAnswerChange, translate } ) => (
	<div className="gsuite-cancel-purchase-dialog__survey">
		<MultipleChoiceQuestion
			question={ translate( 'Please tell us why you are cancelling G Suite:' ) }
			onAnswerChange={ onSurveyAnswerChange }
			disabled={ disabled }
		>
			<MultipleChoiceAnswer
				id={ 'too-expensive' }
				answerText={ translate( "It's too expensive." ) }
			>
				<MultipleChoiceAnswerTextInput />
			</MultipleChoiceAnswer>

			<MultipleChoiceAnswer id={ 'do-not-need-it' } answerText={ translate( "I don't need it." ) }>
				<MultipleChoiceAnswerTextInput />
			</MultipleChoiceAnswer>

			<MultipleChoiceAnswer
				id={ 'purchased-by-mistake' }
				answerText={ translate( 'I purchased it by mistake.' ) }
			/>

			<MultipleChoiceAnswer id={ 'it-did-not-work' } answerText={ translate( "It didn't work." ) }>
				<Button primary>{ translate( 'Get Help Now' ) }</Button>
			</MultipleChoiceAnswer>

			<MultipleChoiceAnswer
				id={ 'another-reason' }
				answerText={ translate( 'Another reason…' ) }
				doNotShuffle
			>
				<MultipleChoiceAnswerTextInput />
			</MultipleChoiceAnswer>
		</MultipleChoiceQuestion>
	</div>
);

GSuiteCancellationSurvey.propTypes = {
	disabled: PropTypes.bool,
	onSurveyAnswerChange: PropTypes.func.isRequired,
	translate: PropTypes.func,
};

GSuiteCancellationSurvey.defaultProps = {
	disabled: false,
};

export default localize( GSuiteCancellationSurvey );
