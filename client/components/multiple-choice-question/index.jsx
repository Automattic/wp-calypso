/**
 * External dependencies
 */
import React, { useState } from 'react';
import { memoize, pick, shuffle, values } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import MultipleChoiceAnswer from './answer';
import FormFieldset from 'components/forms/form-fieldset';
import FormLegend from 'components/forms/form-legend';

/**
 * Style dependencies
 */
import './style.scss';

const shuffleAnswers = memoize(
	( answers ) => {
		const shuffles = shuffle( answers.filter( ( { doNotShuffle } ) => ! doNotShuffle ) );
		return answers.map( ( answer ) => ( answer.doNotShuffle ? answer : shuffles.pop())  );
	},
	( answers ) =>
		answers
			.map( ( answer ) => values( pick( answer, 'id', 'doNotShuffle' ) ).join( '_' ) )
			.join( '-' )
);

const MultipleChoiceQuestion = ( {
	disabled,
	answers,
	onAnswerChange,
	question,
	selectedAnswerId,
	selectedAnswerText,
} ) => {
	const [ selectedAnswer, setSelectedAnswer ] = useState( selectedAnswerId );
	const shuffledAnswers = shuffleAnswers( answers );

	return (
		<FormFieldset className="multiple-choice-question">
			<FormLegend>{ question }</FormLegend>
			{ shuffledAnswers.map( ( answer ) => (
				<MultipleChoiceAnswer
					key={ answer.id }
					answer={ answer }
					disabled={ disabled }
					isSelected={ selectedAnswer === answer.id }
					onAnswerChange={ ( id, textResponse ) => {
						onAnswerChange( id, textResponse );
						setSelectedAnswer( id );
					} }
					selectedAnswerText={ selectedAnswer === answer.id ? selectedAnswerText : '' }
				/>
			) ) }
		</FormFieldset>
	);
};

MultipleChoiceQuestion.propTypes = {
	answers: PropTypes.arrayOf(
		PropTypes.shape( {
			id: PropTypes.string.isRequired,
			answerText: PropTypes.string.isRequired,
			doNotShuffle: PropTypes.bool,
			textInput: PropTypes.bool,
			textInputPrompt: PropTypes.string,
			children: PropTypes.object,
		} )
	).isRequired,
	disabled: PropTypes.bool,
	onAnswerChange: PropTypes.func.isRequired,
	question: PropTypes.string.isRequired,
	selectedAnswerId: PropTypes.string,
	selectedAnswerText: PropTypes.string,
};

MultipleChoiceQuestion.defaultProps = {
	disabled: false,
	selectedAnswerId: null,
	selectedAnswerText: '',
};

export default MultipleChoiceQuestion;
