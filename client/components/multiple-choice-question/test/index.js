/** @format */
/**
 * External dependencies
 */
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
						{ id: 'test-answer-1', answerText: 'Test Anwser One', doNotShuffle: true },
						{ id: 'test-answer-2', answerText: 'Test Anwser Two', doNotShuffle: true },
						{ id: 'test-answer-3', answerText: 'Test Anwser Three', doNotShuffle: true },
						{ id: 'test-answer-4', answerText: 'Test Anwser Four', doNotShuffle: true },
					] }
				/>
			)
			.toJSON();
		expect( tree ).toMatchSnapshot();
	} );

	test( 'should respect `doNotShuffle` on answer', () => {
		const testRender = renderer.create(
			<MultipleChoiceQuestion
				question={ 'Test Question One' }
				answers={ [
					{ id: 'test-answer-1', answerText: 'Test Anwser One' },
					{ id: 'test-answer-2', answerText: 'Test Anwser Two', doNotShuffle: true },
					{ id: 'test-answer-3', answerText: 'Test Anwser Three' },
					{ id: 'test-answer-4', answerText: 'Test Anwser Four' },
				] }
			/>
		);
		const answersAndLegend = testRender.root.findByProps( {
			className: 'multiple-choice-question',
		} ).children;

		expect( answersAndLegend[ 2 ].props.answer.id ).toEqual( 'test-answer-2' );
	} );
} );
