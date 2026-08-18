// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuestionPrompt } from '../../types';
import { QuestionCard } from './QuestionCard';

(
	globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
 ).IS_REACT_ACT_ENVIRONMENT = true;

describe( 'QuestionCard', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach( () => {
		container = document.createElement( 'div' );
		document.body.appendChild( container );
		root = createRoot( container );
	} );

	afterEach( async () => {
		await act( async () => {
			root.unmount();
		} );
		container.remove();
	} );

	it( 'renders text-only choices and submits the message override', async () => {
		const onAnswer = vi.fn();
		const prompt: QuestionPrompt = {
			question: 'Which direction should we take?',
			choices: [
				{ label: 'Concise' },
				{ label: 'Detailed', message: 'Use the detailed option.' },
			],
		};

		await act( async () => {
			root.render(
				<QuestionCard prompt={ prompt } onAnswer={ onAnswer } />
			);
		} );

		expect( container.textContent ).toContain(
			'Which direction should we take?'
		);
		expect(
			container.querySelector( '[data-agenttic-question-card]' )
		).toBeTruthy();
		expect(
			container.querySelector( '[data-slot="choice"]' )?.textContent
		).toContain( 'Concise' );
		expect( container.textContent ).toContain( 'Concise' );

		const detailed = Array.from(
			container.querySelectorAll( 'button' )
		).find( ( button ) => button.textContent?.includes( 'Detailed' ) );

		await act( async () => {
			detailed?.click();
		} );

		expect( onAnswer ).toHaveBeenCalledWith(
			'Use the detailed option.',
			prompt.choices[ 1 ]
		);
	} );

	it( 'lets consumers compose custom choice content', async () => {
		const prompt: QuestionPrompt = {
			question: 'Pick a direction',
			choices: [
				{
					label: 'First',
					description: 'A composed option.',
					presentation: { custom: 'value' },
				},
			],
		};

		await act( async () => {
			root.render(
				<QuestionCard
					prompt={ prompt }
					onAnswer={ vi.fn() }
					renderChoiceContent={ ( choice ) =>
						choice.presentation ? (
							<span data-slot="consumer-content">
								Custom content
							</span>
						) : null
					}
				/>
			);
		} );

		expect( container.textContent ).toContain( 'A composed option.' );
		expect( container.textContent ).toContain( 'Custom content' );
		expect(
			container.querySelector( '[data-slot="consumer-content"]' )
		).toBeTruthy();
	} );

	it( 'disables choices after answering', async () => {
		const onAnswer = vi.fn();
		const prompt: QuestionPrompt = {
			question: 'Choose one',
			choices: [ { label: 'First' } ],
		};

		await act( async () => {
			root.render(
				<QuestionCard
					prompt={ prompt }
					onAnswer={ onAnswer }
					answered
					answeredChoice="First"
				/>
			);
		} );

		const button = container.querySelector( 'button' );
		expect( button?.disabled ).toBe( true );
		expect( button?.getAttribute( 'aria-pressed' ) ).toBe( 'true' );
	} );

	it( 'uses the grid layout for four-choice questions', async () => {
		const prompt: QuestionPrompt = {
			question: 'Choose one',
			choices: [
				{ label: 'First' },
				{ label: 'Second' },
				{ label: 'Third' },
				{ label: 'Fourth' },
			],
		};

		await act( async () => {
			root.render(
				<QuestionCard prompt={ prompt } onAnswer={ vi.fn() } />
			);
		} );

		expect(
			container.querySelector( '[data-slot="choices"]' )?.className
		).toContain( 'choicesGrid' );
	} );

	it( 'keeps two-choice questions stacked', async () => {
		const prompt: QuestionPrompt = {
			question: 'Choose one',
			choices: [ { label: 'First' }, { label: 'Second' } ],
		};

		await act( async () => {
			root.render(
				<QuestionCard prompt={ prompt } onAnswer={ vi.fn() } />
			);
		} );

		expect(
			container.querySelector( '[data-slot="choices"]' )?.className
		).not.toContain( 'choicesGrid' );
		expect( container.querySelector( 'form' ) ).toBeNull();
		expect( container.querySelector( 'input' ) ).toBeNull();
	} );

	it( 'renders no more than four choices', async () => {
		const prompt: QuestionPrompt = {
			question: 'Choose one',
			choices: [
				{ label: 'First' },
				{ label: 'Second' },
				{ label: 'Third' },
				{ label: 'Fourth' },
				{ label: 'Fifth' },
			],
		};

		await act( async () => {
			root.render(
				<QuestionCard prompt={ prompt } onAnswer={ vi.fn() } />
			);
		} );

		expect(
			container.querySelectorAll( '[data-slot="choice"]' )
		).toHaveLength( 4 );
		expect( container.textContent ).not.toContain( 'Fifth' );
	} );
} );
