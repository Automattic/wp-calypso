/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react';
import MultipleChoiceQuestion from '../';

const noop = () => {};

describe( 'MultipleChoiceQuestion', () => {
	test( 'should render with the minimum required properties ( plus extra prop to guarantee order )', () => {
		const { container } = render(
			<MultipleChoiceQuestion
				name="test-question"
				question="Test Question One"
				answers={ [
					{ id: 'test-answer-1', answerText: 'Test Answer One', doNotShuffle: true },
					{ id: 'test-answer-2', answerText: 'Test Answer Two', doNotShuffle: true },
					{ id: 'test-answer-3', answerText: 'Test Answer Three', doNotShuffle: true },
					{ id: 'test-answer-4', answerText: 'Test Answer Four', doNotShuffle: true },
				] }
				onAnswerChange={ noop }
			/>
		);

		expect( container.firstChild ).toMatchSnapshot();
	} );
} );
