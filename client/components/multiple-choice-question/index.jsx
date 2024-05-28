import { memoize, pick, shuffle, values } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLegend from 'calypso/components/forms/form-legend';
import MultipleChoiceAnswer from './answer';

import './style.scss';

const shuffleAnswers = memoize(
	( answers ) => {
		const shuffles = shuffle( answers.filter( ( { doNotShuffle } ) => ! doNotShuffle ) );
		return answers.map( ( answer ) => ( answer.doNotShuffle ? answer : shuffles.pop() ) );
	},
	( answers ) =>
		answers
			.map( ( answer ) => values( pick( answer, 'id', 'doNotShuffle' ) ).join( '_' ) )
			.join( '-' )
);

/**
 * @typedef {import('react').ReactNode} ReactNode
 */

/**
 * Renders a multiple choice question component.
 * @param {Object} props - The component props.
 * @param {boolean} [props.disabled] - Whether the question is disabled or not.
 * @param {Array} props.answers - The array of answer options for the question.
 * @param {string} props.name - The name of the question.
 * @param {Function} props.onAnswerChange - The callback function to handle answer changes.
 * @param {string} props.question - The question text.
 * @param {string|undefined} [props.selectedAnswerId] - The ID of the selected answer.
 * @param {string} [props.selectedAnswerText] - The text of the selected answer.
 * @param {boolean} [props.shouldShuffleAnswers] - Whether to shuffle the answer options or not.
 * @returns {ReactNode} The rendered MultipleChoiceQuestion component.
 */
const MultipleChoiceQuestion = ( {
	disabled = false,
	answers,
	name,
	onAnswerChange,
	question,
	selectedAnswerId = null,
	selectedAnswerText = '',
	shouldShuffleAnswers = true,
} ) => {
	const [ selectedAnswer, setSelectedAnswer ] = useState( selectedAnswerId );
	const shuffledAnswers = shouldShuffleAnswers ? shuffleAnswers( answers ) : answers;

	useEffect( () => {
		setSelectedAnswer( selectedAnswerId );
	}, [ selectedAnswerId ] );

	return (
		<FormFieldset className="multiple-choice-question" onClick={ ( e ) => e.stopPropagation() }>
			<FormLegend>{ question }</FormLegend>
			<div className="multiple-choice-question__answers">
				{ shuffledAnswers.map( ( answer ) => (
					<MultipleChoiceAnswer
						name={ name }
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
			</div>
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
	name: PropTypes.string.isRequired,
	onAnswerChange: PropTypes.func.isRequired,
	question: PropTypes.string.isRequired,
	selectedAnswerId: PropTypes.string,
	selectedAnswerText: PropTypes.string,
	shouldShuffleAnswers: PropTypes.bool,
};

export default MultipleChoiceQuestion;
