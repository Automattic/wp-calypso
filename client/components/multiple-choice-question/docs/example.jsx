/** @format */

/**
 * External dependencies
 */

import React, { useState } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card/compact';
import CardHeading from 'components/card-heading';
import MultipleChoiceQuestion from '../';
import MultipleChoiceAnswer from '../answer';
import MultipleChoiceAnswerTextInput from '../answer-text-input';
import notices from 'notices';

function MultipleChoiceQuestionExamples() {
	const [ selectedAnswer, setSelectedAnswer ] = useState( null );
	const [ answerText, setAnswerText ] = useState( '' );

	return (
		<div>
			<Card>
				<MultipleChoiceQuestion
					question={ 'Please choose one of the following:' }
					onAnswerChange={ ( answer, text ) => {
						setSelectedAnswer( answer );
						setAnswerText( text || '' );
					} }
				>
					<MultipleChoiceAnswer id={ 'hungry-bunnies' } answerText={ 'Hungry Bunnies' } />
					<MultipleChoiceAnswer id={ 'ravenous-rhinos' } answerText={ 'Ravenous Rhinos' }>
						<MultipleChoiceAnswerTextInput prompt={ 'How many?' } />
					</MultipleChoiceAnswer>
					<MultipleChoiceAnswer id={ 'starving-storks' } answerText={ 'Starving Storks' }>
						<Button
							onClick={ () => {
								notices.success( 'The Stork Button was clicked', { duration: 5000 } );
							} }
							primary
						>
							{ 'The Stork Button' }
						</Button>
					</MultipleChoiceAnswer>
					<MultipleChoiceAnswer
						id={ 'something-else' }
						answerText={ 'Something Else' }
						doNotShuffle
					>
						<MultipleChoiceAnswerTextInput prompt={ 'Who else?' } />
						<Button
							onClick={ () => {
								notices.success( 'The Extra Button was clicked', { duration: 5000 } );
							} }
						>
							{ 'The Extra Button' }
						</Button>
					</MultipleChoiceAnswer>
				</MultipleChoiceQuestion>
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
