/** @format */

/**
 * External dependencies
 */

import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import CardHeading from 'components/card-heading';
import MultipleChoiceQuestion from '../index';

function MultipleChoiceQuestionExamples() {
	const [ selectedAnswer, setSelectedAnswer ] = useState( null );
	const [ answerText, setAnswerText ] = useState( '' );

	const question = 'Please choose one of the following:';
	const answers = [
		{ id: 'hungry-bunnies', answerText: 'Hungry Bunnies' },
		{
			id: 'ravenous-rhinos',
			answerText: 'Ravenous Rhinos',
			textInput: true,
			textInputPrompt: 'How many?',
		},
		{ id: 'starving-storks', answerText: 'Starving Storks' },
		{
			id: 'something-else',
			answerText: 'Something Else',
			doNotShuffle: true,
			textInput: true,
			textInputPrompt: 'Who else?',
		},
	];

	return (
		<div>
			<Card>
				<MultipleChoiceQuestion
					question={ question }
					answers={ answers }
					onAnswerChange={ ( answer, text ) => {
						setSelectedAnswer( answer );
						setAnswerText( text || '' );
					} }
				/>
			</Card>
			<Card>
				<CardHeading>{ 'Selected Answer' }</CardHeading>
				<p>
					<b>Selected Answer is: </b>
					{ selectedAnswer ? selectedAnswer : 'No Answer Currently Selected' }
				</p>
				<p>
					<b>Answer Text is: </b>
					{ answerText }
				</p>
			</Card>
		</div>
	);
}

MultipleChoiceQuestionExamples.displayName = 'MultipleChoiceQuestion';

export default MultipleChoiceQuestionExamples;
