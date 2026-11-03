/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { CreditsAnswer } from '../../components/credits-answer';
import { creditSnapshot } from '../../utils/__tests__/fixtures/credit-snapshot';
import { buildLiveCreditsStatus } from '../../utils/live-credits';
import { useCreditsCommand } from '../use-credits-command';

jest.mock( '@wordpress/element', () => jest.requireActual( 'react' ) );
jest.mock( 'i18n-calypso', () => ( { getBrowserSafeLocale: () => 'en' } ) );
jest.mock( '../../components/credits-answer', () => ( { CreditsAnswer: () => null } ) );
jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	_n: ( single: string, plural: string ) => plural || single,
	sprintf: ( format: string ) => format,
} ) );

const creditsAnswer = {
	status: buildLiveCreditsStatus( creditSnapshot() ),
	resetDate: 'Oct 1',
	actions: [],
};
const setup = ( overrides: Partial< Parameters< typeof useCreditsCommand >[ 0 ] > = {} ) => {
	const addMessage = jest.fn();
	const beforeSubmit = jest.fn( () => false );
	const clearError = jest.fn();
	const { result } = renderHook( () =>
		useCreditsCommand( { creditsAnswer, beforeSubmit, addMessage, clearError, ...overrides } )
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
					componentProps: { ...creditsAnswer, createdAt: question.timestamp },
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

	it( 'does not handle other messages', () => {
		const { result, addMessage } = setup();

		expect( result.current.handleCommand( 'Write a post' ) ).toBe( false );
		expect( result.current.handleCommand( '/credits please' ) ).toBe( false );
		expect( addMessage ).not.toHaveBeenCalled();
	} );

	it( 'does not handle /credits without a live balance, so it goes out as any text and the gate stays', () => {
		const { result, addMessage, beforeSubmit } = setup( { creditsAnswer: undefined } );

		expect( result.current.handleCommand( '/credits' ) ).toBe( false );
		expect( addMessage ).not.toHaveBeenCalled();
		expect( result.current.beforeSubmit( '/credits' ) ).toBe( false );
		expect( beforeSubmit ).toHaveBeenCalledTimes( 1 );
	} );
} );
