/**
 * External dependencies
 */
import { noop } from 'lodash';
import React from 'react';
import renderer from 'react-test-renderer';

/**
 * Internal dependencies
 */
import MultipleChoiceQuestion from '../';

describe( 'MultipleChoiceQuestion', () => {
	test( 'should render with the minimum required properties ( plus extra prop to guarantee order )', () => {
		const tree = renderer
			.create(
				<MultipleChoiceQuestion
					question={ 'Test Question One' }
					answers={ [
						{ id: 'test-answer-1', answerText: 'Test Answer One', doNotShuffle: true },
						{ id: 'test-answer-2', answerText: 'Test Answer Two', doNotShuffle: true },
						{ id: 'test-answer-3', answerText: 'Test Answer Three', doNotShuffle: true },
						{ id: 'test-answer-4', answerText: 'Test Answer Four', doNotShuffle: true },
					] }
					onAnswerChange={ noop }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
