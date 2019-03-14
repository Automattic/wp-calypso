/** @format */
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
import MultipleChoiceAnswer from '../answer';

describe( 'MultipleChoiceQuestion', () => {
	test( 'should render with the minimum required properties ( plus extra prop to guarantee order )', () => {
		const tree = renderer
			.create(
				<MultipleChoiceQuestion question={ 'Test Question One' } onAnswerChange={ noop }>
					<MultipleChoiceAnswer
						id={ 'test-answer-1' }
						answerText={ 'Test Answer One' }
						doNotShuffle
					/>
					<MultipleChoiceAnswer
						id={ 'test-answer-2' }
						answerText={ 'Test Answer Two' }
						doNotShuffle
					/>
					<MultipleChoiceAnswer
						id={ 'test-answer-3' }
						answerText={ 'Test Answer Three' }
						doNotShuffle
					/>
					<MultipleChoiceAnswer
						id={ 'test-answer-4' }
						answerText={ 'Test Answer Four' }
						doNotShuffle
					/>
				</MultipleChoiceQuestion>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );
} );
