/** @format */

/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card/compact';
import MultipleChoiceQuestion from '../index';

class MultipleChoiceQuestionExamples extends PureComponent {
	static displayName = 'MultipleChoiceQuestion';

	render() {
		return (
			<Card>
				<MultipleChoiceQuestion
					question={ 'Please choose one of the following:' }
					answers={ [ 'Hungry Bunnies', 'Ravenous Rhinos', 'Starving Storks', 'Something Else' ] }
				/>
			</Card>
		);
	}
}

export default MultipleChoiceQuestionExamples;
