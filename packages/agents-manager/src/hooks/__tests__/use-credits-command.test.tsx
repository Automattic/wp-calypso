/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { CreditsAnswer } from '../../components/credits-answer';
import { creditSnapshot } from '../../utils/__tests__/fixtures/credit-snapshot';
import { buildLiveCreditsStatus } from '../../utils/live-credits';
import { useCreditsCommand } from '../use-credits-command';

vi.mock(
	'@wordpress/element',
	async () => await vi.importActual< typeof import( 'react' ) >( 'react' )
);
vi.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );
vi.mock( '../../components/credits-answer', () => ( { CreditsAnswer: () => null } ) );
vi.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_n: ( single: string, plural: string ) => plural || single,
	sprintf: ( format: string ) => format,
} ) );

const answerContent = {
	status: buildLiveCreditsStatus( creditSnapshot() ),
	resetDate: 'Oct 1',
	actions: [],
};
const reply = { state: 'balance' as const, answer: answerContent };
const setup = ( overrides: Partial< Parameters< typeof useCreditsCommand >[ 0 ] > = {} ) => {
	const addMessage = vi.fn();
	const beforeSubmit = vi.fn( () => false );
	const clearError = vi.fn();
	const { result } = renderHook( () =>
		useCreditsCommand( { reply, beforeSubmit, addMessage, clearError, ...overrides } )
	);
	return { result, addMessage, beforeSubmit, clearError };
};

describe( 'useCreditsCommand', () => {
	it( 'shows the question and answers it with a UI-only card, neither sent to the model', () => {
		const { result, addMessage } = setup();

		expect( result.current.handleCommand( ' /credits ' ) ).toBe( true );

		expect( addMessage ).toHaveBeenCalledTimes( 2 );
		const [ [ question ], [ answer ] ] = addMessage.mock.calls;
		expect( question ).toMatchObject( {
			id: expect.stringMatching( /^credits-command-question-/ ),
			role: 'user',
			content: [ { type: 'text', text: '/credits' } ],
			isUiOnly: true,
		} );
		expect( answer ).toMatchObject( {
			id: expect.stringMatching( /^credits-command-(?!question)/ ),
			role: 'agent',
			content: [
				{ type: 'text', text: 'Here’s where your site credits stand.' },
				{
					type: 'component',
					component: CreditsAnswer,
					componentProps: { ...answerContent, createdAt: question.timestamp },
				},
			],
		} );
		expect( answer.timestamp ).toBeGreaterThan( question.timestamp );
	} );

	it( 'lets /credits past the credits gate, so a used-up site can still ask', () => {
		const { result, beforeSubmit } = setup();

		expect( result.current.beforeSubmit( '/credits' ) ).toBe( true );
		expect( beforeSubmit ).not.toHaveBeenCalled();
	} );

	it( 'keeps the gate for every other message', () => {
		const { result, beforeSubmit } = setup();

		expect( result.current.beforeSubmit( 'Write a post' ) ).toBe( false );
		expect( beforeSubmit ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'clears a failed send’s error when it answers, and only then', () => {
		const { result, clearError } = setup();

		result.current.handleCommand( 'Write a post' );
		expect( clearError ).not.toHaveBeenCalled();

		result.current.handleCommand( '/credits' );
		expect( clearError ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [
		[ 'loading', 'I’m still loading your site credits. Try again in a moment.' ],
		[ 'failed', 'I couldn’t check your site credits right now. Try again in a moment.' ],
		[ 'unmetered', 'This site has no AI credits, so there’s no balance to show.' ],
	] as const )( 'answers a %s read locally with text only, never sending it', ( state, text ) => {
		const { result, addMessage } = setup( { reply: { state } } );

		expect( result.current.handleCommand( '/credits' ) ).toBe( true );

		const [ , [ reply ] ] = addMessage.mock.calls;
		expect( reply.content[ 0 ] ).toEqual( { type: 'text', text } );
		expect( reply.content[ 1 ] ).toMatchObject( {
			type: 'component',
			componentProps: { text, createdAt: expect.any( Number ) },
		} );
		expect( reply.content[ 1 ].componentProps ).not.toHaveProperty( 'status' );
	} );

	it( 'shows the last known balance with a note when a read failed', () => {
		const { result, addMessage } = setup( { reply: { state: 'stale', answer: answerContent } } );

		result.current.handleCommand( '/credits' );

		const [ , [ reply ] ] = addMessage.mock.calls;
		expect( reply.content[ 0 ].text ).toBe(
			'I couldn’t refresh your credits just now. This is the last balance I have.'
		);
		expect( reply.content[ 1 ].componentProps ).toMatchObject( answerContent );
	} );

	it( 'does not handle other messages', () => {
		const { result, addMessage } = setup();

		expect( result.current.handleCommand( 'Write a post' ) ).toBe( false );
		expect( result.current.handleCommand( '/credits please' ) ).toBe( false );
		expect( addMessage ).not.toHaveBeenCalled();
	} );

	it( 'does not handle /credits without a live balance, so it goes out as any text and the gate stays', () => {
		const { result, addMessage, beforeSubmit } = setup( { reply: undefined } );

		expect( result.current.handleCommand( '/credits' ) ).toBe( false );
		expect( addMessage ).not.toHaveBeenCalled();
		expect( result.current.beforeSubmit( '/credits' ) ).toBe( false );
		expect( beforeSubmit ).toHaveBeenCalledTimes( 1 );
	} );
} );
