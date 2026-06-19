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

	it( 'renders optional choice presentation', async () => {
		const prompt: QuestionPrompt = {
			question: 'Pick a visual style',
			choices: [
				{
					label: 'Editorial',
					description: 'A type-led direction.',
					presentation: {
						swatches: [ '#111111', 'rebeccapurple' ],
						font_sample: {
							heading: 'Feature heading',
							body: 'Readable body copy',
							heading_font: 'Georgia, serif',
							body_font: 'Arial, sans-serif',
						},
						image: {
							url: 'https://example.com/style.png',
							alt: 'Style preview',
						},
						layout_hint: 'Use a strong hero and compact cards.',
					},
				},
			],
		};

		await act( async () => {
			root.render(
				<QuestionCard prompt={ prompt } onAnswer={ vi.fn() } />
			);
		} );

		expect( container.textContent ).toContain( 'A type-led direction.' );
		expect( container.textContent ).toContain( 'Feature heading' );
		expect( container.textContent ).toContain(
			'Use a strong hero and compact cards.'
		);
		expect( container.querySelectorAll( '[title]' ) ).toHaveLength( 2 );
		expect( container.querySelector( 'img' )?.getAttribute( 'alt' ) ).toBe(
			'Style preview'
		);
		expect(
			container.querySelector( '[data-slot="presentation"]' )
		).toBeTruthy();
		expect(
			container.querySelector( '[data-slot="font-sample"]' )
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

	it( 'submits freeform answers when allowed', async () => {
		const onAnswer = vi.fn();
		const prompt: QuestionPrompt = {
			question: 'Choose or describe one',
			choices: [ { label: 'First' } ],
			allow_freeform: true,
			freeform_label: 'Custom answer',
			freeform_placeholder: 'Describe another option',
		};

		await act( async () => {
			root.render(
				<QuestionCard prompt={ prompt } onAnswer={ onAnswer } />
			);
		} );

		const input = container.querySelector( 'input' );
		expect( input?.getAttribute( 'placeholder' ) ).toBe(
			'Describe another option'
		);

		await act( async () => {
			Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				'value'
			)?.set?.call( input, 'Use a warmer palette' );
			input!.dispatchEvent( new Event( 'input', { bubbles: true } ) );
		} );

		await act( async () => {
			container.querySelector( 'form' )?.requestSubmit();
		} );

		expect( onAnswer ).toHaveBeenCalledWith( 'Use a warmer palette', {
			label: 'Custom answer',
		} );
	} );
} );
