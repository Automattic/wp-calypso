/** @format */

/**
 * External dependencies
 */
import React, { useState } from 'react';
import { memoize, pick, shuffle, values } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import AnswerItem from './answer-item';
import FormLegend from 'components/forms/form-legend';

/**
 * Style dependencies
 */
import './style.scss';

const shuffleAnswers = memoize(
	answers => {
		const shuffles = shuffle( answers.filter( ( { doNotShuffle } ) => ! doNotShuffle ) );
		return answers.map( answer => ( answer.doNotShuffle ? answer : shuffles.pop() ) );
	},
	answers =>
		answers.map( answer => values( pick( answer, 'id', 'doNotShuffle' ) ).join( '_' ) ).join( '-' )
);

const MultipleChoiceQuestion = ( { question, onAnswerChange, answers } ) => {
	const [ selectedAnswer, setSelectedAnswer ] = useState( null );
	const shuffledAnswers = shuffleAnswers( answers );

	return (
		<div className="multiple-choice-question">
			<FormLegend>{ question }</FormLegend>
			{ shuffledAnswers.map( answer => (
				<AnswerItem
					key={ answer.id }
					answer={ answer }
					isSelected={ selectedAnswer === answer.id }
					onAnswerChange={ ( id, textResponse ) => {
						onAnswerChange( id, textResponse );
						setSelectedAnswer( id );
					} }
				/>
			) ) }
		</div>
	);
};

MultipleChoiceQuestion.propTypes = {
	question: PropTypes.string.isRequired,
	answers: PropTypes.arrayOf(
		PropTypes.shape( {
			id: PropTypes.string.isRequired,
			answerText: PropTypes.string.isRequired,
			doNotShuffle: PropTypes.bool,
			textInput: PropTypes.bool,
			textInputPrompt: PropTypes.string,
		} )
	).isRequired,
	onAnswerChange: PropTypes.func,
};

export default MultipleChoiceQuestion;
