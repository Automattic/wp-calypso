import { memoize, pick, shuffle, values } from 'lodash';
import PropTypes from 'prop-types';
import { useState } from 'react';
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

const MultipleChoiceQuestion = ( {
	disabled,
	answers,
	onAnswerChange,
	question,
	selectedAnswerId,
	selectedAnswerText,
	shouldShuffleAnswers,
} ) => {
	const [ selectedAnswer, setSelectedAnswer ] = useState( selectedAnswerId );
	const shuffledAnswers = shouldShuffleAnswers ? shuffleAnswers( answers ) : answers;
	return (
		<FormFieldset className="multiple-choice-question" onClick={ ( e ) => e.stopPropagation() }>
			<FormLegend>{ question }</FormLegend>
			<div className="multiple-choice-question__answers">
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
	onAnswerChange: PropTypes.func.isRequired,
	question: PropTypes.string.isRequired,
	selectedAnswerId: PropTypes.string,
	selectedAnswerText: PropTypes.string,
	shouldShuffleAnswers: PropTypes.bool,
};

MultipleChoiceQuestion.defaultProps = {
	disabled: false,
	selectedAnswerId: null,
	selectedAnswerText: '',
	shouldShuffleAnswers: true,
};

export default MultipleChoiceQuestion;
