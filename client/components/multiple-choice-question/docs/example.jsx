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

	const question = 'Please choose one of the following:';
	const answers = [
		{ prompt: 'Hungry Bunnies' },
		{ prompt: 'Ravenous Rhinos' },
		{ prompt: 'Starving Storks' },
		{ prompt: 'Something Else' },
	];

	return (
		<div>
			<Card>
				<MultipleChoiceQuestion
					question={ question }
					answers={ answers }
					onAnswerSelected={ answer => setSelectedAnswer( answer ) }
				/>
			</Card>
			<Card>
				<CardHeading>{ 'Selected Answer' }</CardHeading>
				<p>
					<b>Selected Answer is: </b>
					{ selectedAnswer ? selectedAnswer : 'No Answer Currently Selected' }
				</p>
			</Card>
		</div>
	);
}

MultipleChoiceQuestionExamples.displayName = 'MultipleChoiceQuestion';

export default MultipleChoiceQuestionExamples;
