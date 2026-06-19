import { isValidElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { AgentsApiToolGroup } from './types';
import {
	createPresentQuestionRenderer,
	createPresentQuestionToolRenderers,
	normalizePresentQuestionPrompt,
	type PresentQuestionCardProps,
} from './tool-rendering';

function FakeQuestionCard( _props: PresentQuestionCardProps ) {
	return null;
}

describe( 'present_question tool rendering', () => {
	it( 'normalizes valid question prompt payloads', () => {
		expect(
			normalizePresentQuestionPrompt( {
				prompt: {
					question: 'Choose a direction',
					choices: [
						{ label: 'Minimal' },
						{ label: 'Bold', message: 'Use the bold direction.' },
						{ missing: 'label' },
					],
				},
			} )
		).toEqual( {
			question: 'Choose a direction',
			choices: [
				{ label: 'Minimal' },
				{ label: 'Bold', message: 'Use the bold direction.' },
			],
			allow_freeform: undefined,
			freeform_label: undefined,
			freeform_placeholder: undefined,
		} );

		expect(
			normalizePresentQuestionPrompt( { question: 'Missing choices' } )
		).toBeNull();
	} );

	it( 'creates a present_question renderer that returns the supplied QuestionCard', () => {
		const onAnswer = vi.fn();
		const group: AgentsApiToolGroup = {
			id: 'tool-1',
			name: 'present_question',
			result: {
				id: 'tool-1',
				message: {} as AgentsApiToolGroup[ 'result' ][ 'message' ],
				result: {
					question: 'Pick one',
					choices: [ { label: 'First' } ],
				},
			},
		};

		const element = createPresentQuestionRenderer( {
			QuestionCard: FakeQuestionCard,
			onAnswer,
			answered: ( currentGroup ) => currentGroup.id === 'tool-1',
			answeredChoice: 'First',
		} )( group );

		expect( isValidElement( element ) ).toBe( true );
		expect( element ).toMatchObject( {
			type: FakeQuestionCard,
			props: {
				prompt: {
					question: 'Pick one',
					choices: [ { label: 'First' } ],
				},
				answered: true,
				answeredChoice: 'First',
			},
		} );

		( element as { props: PresentQuestionCardProps } ).props.onAnswer(
			'First',
			{ label: 'First' }
		);

		expect( onAnswer ).toHaveBeenCalledWith(
			'First',
			{ label: 'First' },
			group
		);
	} );

	it( 'creates the default renderer map entry', () => {
		const renderers = createPresentQuestionToolRenderers( {
			QuestionCard: FakeQuestionCard,
			onAnswer: vi.fn(),
		} );

		expect( renderers.present_question ).toBeTypeOf( 'function' );
	} );
} );
