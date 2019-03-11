/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import CardHeading from 'components/card-heading';
import MultipleChoiceQuestion from '../index';

class MultipleChoiceQuestionExamples extends PureComponent {
	static displayName = 'MultipleChoiceQuestion';

	state = {
		selectedAnswer: null,
	};

	onAnswerSelected = selectedAnswer => {
		this.setState( { selectedAnswer } );
	};

	render() {
		const { selectedAnswer } = this.state;
		return (
			<div>
				<Card>
					<MultipleChoiceQuestion
						question={ 'Please choose one of the following:' }
						answers={ [ 'Hungry Bunnies', 'Ravenous Rhinos', 'Starving Storks', 'Something Else' ] }
						onAnswerSelected={ this.onAnswerSelected }
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
}

export default MultipleChoiceQuestionExamples;
