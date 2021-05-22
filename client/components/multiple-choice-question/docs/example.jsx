/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Internal dependencies
 */
import { Button, CompactCard as Card } from '@automattic/components';
import CardHeading from 'calypso/components/card-heading';
import MultipleChoiceQuestion from '../';
import { successNotice } from 'calypso/state/notices/actions';

function MultipleChoiceQuestionExamples() {
	const [ selectedAnswer, setSelectedAnswer ] = useState( null );
	const [ answerText, setAnswerText ] = useState( '' );
	const dispatch = useDispatch();

	const answers = [
		{ id: 'hungry-bunnies', answerText: 'Hungry Bunnies' },
		{
			id: 'ravenous-rhinos',
			answerText: 'Ravenous Rhinos',
			textInput: true,
			textInputPrompt: 'How many?',
		},
		{
			id: 'starving-storks',
			answerText: 'Starving Storks',
			children: (
				<Button
					onClick={ () => {
						dispatch( successNotice( 'The Stork Button was clicked', { duration: 5000 } ) );
					} }
					primary
				>
					{ 'The Stork Button' }
				</Button>
			),
		},
		{
			id: 'something-else',
			answerText: 'Something Else',
			doNotShuffle: true,
			textInput: true,
			textInputPrompt: 'Who else?',
			children: (
				<Button
					onClick={ () => {
						dispatch( successNotice( 'The Extra Button was clicked', { duration: 5000 } ) );
					} }
				>
					{ 'The Extra Button' }
				</Button>
			),
		},
	];

	return (
		<div>
			<Card>
				<MultipleChoiceQuestion
					answers={ answers }
					question={ 'Please choose one of the following:' }
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
