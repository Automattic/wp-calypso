/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { renderHook, act } from '@testing-library/react';
import { useAgentsManagerContext } from '../../../contexts';
import { getSessionId as getStoredSessionId } from '../../../utils/agent-session';
import useFeedback from '../index';
import type { Message } from '@automattic/agenttic-ui/dist/types';

// Capture the onFeedback callback passed to createFeedbackActions
let capturedOnFeedback: ( messageId: string, feedback: 'up' | 'down' ) => void;
let capturedCondition: ( ( message: Message ) => boolean ) | undefined;

jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		createFeedbackActions: jest.fn( ( { onFeedback, condition } ) => {
			capturedOnFeedback = onFeedback;
			capturedCondition = condition;
			return {
				getActionsForMessage: jest.fn(),
				onChange: jest.fn(),
				offChange: jest.fn(),
			};
		} ),
		ThumbsUpIcon: () => null,
		ThumbsDownIcon: () => null,
	} ),
	{ virtual: true }
);
jest.mock( '@automattic/calypso-analytics', () => ( { recordTracksEvent: jest.fn() } ), {
	virtual: true,
} );
jest.mock( '../../../utils/agent-session' );
jest.mock( '../../../contexts', () => ( {
	useAgentsManagerContext: jest.fn(),
} ) );

const mockUseAgentsManagerContext = useAgentsManagerContext as jest.MockedFunction<
	typeof useAgentsManagerContext
>;

const mockFetch = jest.fn().mockResolvedValue( { ok: true } );
global.fetch = mockFetch;

const mockRegisterMessageActions = jest.fn();
const mockRecordTracksEvent = recordTracksEvent as jest.MockedFunction< typeof recordTracksEvent >;
const mockGetStoredSessionId = getStoredSessionId as jest.MockedFunction<
	typeof getStoredSessionId
>;

const mockAuthProvider = jest.fn().mockResolvedValue( { Authorization: 'Bearer test-token' } );

const createMessage = ( id: string, role: 'user' | 'agent', text: string ): Message => ( {
	id,
	role,
	content: [ { type: 'text', text } ],
} );

/** Triggers the captured onFeedback callback with the given direction. */
async function triggerFeedback( messageId: string, direction: 'up' | 'down' ) {
	await act( async () => {
		capturedOnFeedback( messageId, direction );
	} );
}

/** Finds the fetch call whose URL contains the given substring. */
function findFetchCall( urlSubstring: string ) {
	return mockFetch.mock.calls.find(
		( call: string[] ) => typeof call[ 0 ] === 'string' && call[ 0 ].includes( urlSubstring )
	);
}

describe( 'useFeedback', () => {
	const defaultAgentConfig = {
		agentId: 'test-agent',
		sessionId: 'session-abc',
		authProvider: mockAuthProvider,
	};

	beforeEach( () => {
		jest.clearAllMocks();
		mockFetch.mockResolvedValue( { ok: true } );
		mockGetStoredSessionId.mockReturnValue( 'stored-session-123' );
		mockUseAgentsManagerContext.mockReturnValue( {
			agentConfig: defaultAgentConfig,
		} as unknown as ReturnType< typeof useAgentsManagerContext > );
	} );

	const defaultConfig = {
		registerMessageActions: mockRegisterMessageActions,
		messages: [] as Message[],
	};

	describe( 'initialization', () => {
		it( 'registers feedback actions on mount', () => {
			renderHook( () => useFeedback( defaultConfig ) );

			expect( mockRegisterMessageActions ).toHaveBeenCalledWith(
				expect.objectContaining( {
					id: 'agents-manager-feedback',
					actions: expect.any( Function ),
				} )
			);
		} );

		it( 'only registers once across rerenders', () => {
			const { rerender } = renderHook( () => useFeedback( defaultConfig ) );
			rerender();

			expect( mockRegisterMessageActions ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'resets registration when session changes', () => {
			const { rerender } = renderHook( ( props ) => useFeedback( props ), {
				initialProps: defaultConfig,
			} );

			mockUseAgentsManagerContext.mockReturnValue( {
				agentConfig: { ...defaultAgentConfig, sessionId: 'new-session' },
			} as unknown as ReturnType< typeof useAgentsManagerContext > );

			rerender( defaultConfig );

			expect( mockRegisterMessageActions ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'passes condition that filters to agent messages only', () => {
			renderHook( () => useFeedback( defaultConfig ) );

			expect( capturedCondition?.( createMessage( '1', 'agent', 'hi' ) ) ).toBe( true );
			expect( capturedCondition?.( createMessage( '2', 'user', 'hi' ) ) ).toBe( false );
		} );
	} );

	describe( 'thumbs up feedback', () => {
		it( 'sends rating with `message_text` via fetch', async () => {
			const messages = [ createMessage( 'msg-1', 'agent', 'Here is the answer' ) ];
			renderHook( () => useFeedback( { ...defaultConfig, messages } ) );

			await triggerFeedback( 'msg-1', 'up' );

			expect( mockAuthProvider ).toHaveBeenCalled();
			expect( mockFetch ).toHaveBeenCalledWith(
				'https://public-api.wordpress.com/wpcom/v2/ai/feedback/session-abc/rate',
				expect.objectContaining( {
					method: 'POST',
					headers: expect.objectContaining( { Authorization: 'Bearer test-token' } ),
					body: JSON.stringify( {
						message_id: 'msg-1',
						rating: 'up',
						message_text: 'Here is the answer',
					} ),
				} )
			);
		} );

		it( 'records tracks event', async () => {
			renderHook( () => useFeedback( defaultConfig ) );
			await triggerFeedback( 'msg-1', 'up' );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_agents_manager_response_feedback_action',
				{ type: 'thumb_up', message_id: 'msg-1' }
			);
		} );

		it( 'does not show feedback input', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );
			await triggerFeedback( 'msg-1', 'up' );

			expect( result.current.showFeedbackInput ).toBe( false );
		} );
	} );

	describe( 'thumbs down feedback', () => {
		it( 'sends rating with `message_text` via fetch', async () => {
			const messages = [ createMessage( 'msg-1', 'agent', 'Bad answer' ) ];
			renderHook( () => useFeedback( { ...defaultConfig, messages } ) );

			await triggerFeedback( 'msg-1', 'down' );

			expect( mockFetch ).toHaveBeenCalledWith(
				'https://public-api.wordpress.com/wpcom/v2/ai/feedback/session-abc/rate',
				expect.objectContaining( {
					method: 'POST',
					body: JSON.stringify( {
						message_id: 'msg-1',
						rating: 'down',
						message_text: 'Bad answer',
					} ),
				} )
			);
		} );

		it( 'records tracks event', async () => {
			renderHook( () => useFeedback( defaultConfig ) );
			await triggerFeedback( 'msg-1', 'down' );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_agents_manager_response_feedback_action',
				{ type: 'thumb_down', message_id: 'msg-1' }
			);
		} );

		it( 'shows feedback input', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );
			await triggerFeedback( 'msg-1', 'down' );

			expect( result.current.showFeedbackInput ).toBe( true );
		} );
	} );

	describe( 'feedback text submission', () => {
		it( 'submits feedback with conversation context via fetch', async () => {
			const messages = [
				createMessage( 'msg-1', 'user', 'How do I set up my site?' ),
				createMessage( 'msg-2', 'agent', 'Here are the steps...' ),
				createMessage( 'msg-3', 'user', 'That did not work' ),
				createMessage( 'msg-4', 'agent', 'Let me try a different approach...' ),
			];

			const { result } = renderHook( () => useFeedback( { ...defaultConfig, messages } ) );
			await triggerFeedback( 'msg-4', 'down' );

			await act( async () => {
				await result.current.submitFeedbackText( 'The solution was unclear' );
			} );

			const textCall = findFetchCall( '/text' );
			expect( textCall ).toBeDefined();
			expect( textCall[ 0 ] ).toBe(
				'https://public-api.wordpress.com/wpcom/v2/ai/feedback/session-abc/text'
			);
			const body = JSON.parse( textCall[ 1 ].body );
			expect( body ).toEqual(
				expect.objectContaining( {
					message_id: 'msg-4',
					feedback: 'The solution was unclear',
					previous_messages: [
						{ role: 'user', text: 'How do I set up my site?' },
						{ role: 'agent', text: 'Here are the steps...' },
						{ role: 'user', text: 'That did not work' },
						{ role: 'agent', text: 'Let me try a different approach...' },
					],
				} )
			);
		} );

		it( 'limits conversation context to last 4 messages', async () => {
			const messages = [
				createMessage( 'msg-1', 'user', 'Message 1' ),
				createMessage( 'msg-2', 'agent', 'Message 2' ),
				createMessage( 'msg-3', 'user', 'Message 3' ),
				createMessage( 'msg-4', 'agent', 'Message 4' ),
				createMessage( 'msg-5', 'user', 'Message 5' ),
				createMessage( 'msg-6', 'agent', 'Message 6' ),
			];

			const { result } = renderHook( () => useFeedback( { ...defaultConfig, messages } ) );
			await triggerFeedback( 'msg-6', 'down' );

			await act( async () => {
				await result.current.submitFeedbackText( 'Test feedback' );
			} );

			const callData = JSON.parse( findFetchCall( '/text' )[ 1 ].body );
			expect( callData.previous_messages ).toHaveLength( 4 );
			expect( callData.previous_messages[ 0 ].text ).toBe( 'Message 3' );
		} );

		it( 'records tracks event when feedback text is submitted', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );
			await triggerFeedback( 'msg-1', 'down' );

			await act( async () => {
				await result.current.submitFeedbackText( 'Helpful feedback' );
			} );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_agents_manager_response_feedback_submitted',
				{ message_id: 'msg-1' }
			);
		} );

		it( 'uses stored session ID when `sessionId` is empty', async () => {
			mockUseAgentsManagerContext.mockReturnValue( {
				agentConfig: { ...defaultAgentConfig, sessionId: '' },
			} as unknown as ReturnType< typeof useAgentsManagerContext > );

			const { result } = renderHook( () => useFeedback( defaultConfig ) );
			await triggerFeedback( 'msg-1', 'down' );

			await act( async () => {
				await result.current.submitFeedbackText( 'Test' );
			} );

			expect( findFetchCall( '/text' )[ 0 ] ).toBe(
				'https://public-api.wordpress.com/wpcom/v2/ai/feedback/stored-session-123/text'
			);
		} );

		it( 'does not submit if feedback text is empty', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );
			await triggerFeedback( 'msg-1', 'down' );
			mockFetch.mockClear();

			await act( async () => {
				await result.current.submitFeedbackText( '   ' );
			} );

			expect( mockFetch ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'feedback cancellation', () => {
		it( 'hides feedback input when cancelled', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );
			await triggerFeedback( 'msg-1', 'down' );

			expect( result.current.showFeedbackInput ).toBe( true );

			act( () => {
				result.current.resetFeedback();
			} );

			expect( result.current.showFeedbackInput ).toBe( false );
		} );
	} );

	describe( 'no `authProvider`', () => {
		it( 'does not send rating when `authProvider` is not provided', async () => {
			mockUseAgentsManagerContext.mockReturnValue( {
				agentConfig: { ...defaultAgentConfig, authProvider: undefined },
			} as unknown as ReturnType< typeof useAgentsManagerContext > );

			renderHook( () => useFeedback( defaultConfig ) );
			await triggerFeedback( 'msg-1', 'up' );

			expect( mockFetch ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'conversation context extraction', () => {
		it( 'replaces tool messages with placeholder in conversation context', async () => {
			const toolJson = JSON.stringify( {
				tool_id: 'big_sky__show_component',
				data: { type: 'site-analytics' },
			} );
			const messages = [
				createMessage( 'msg-1', 'user', 'Show me analytics' ),
				createMessage( 'msg-2', 'agent', toolJson ),
				createMessage( 'msg-3', 'agent', 'Here are your analytics' ),
			];

			const { result } = renderHook( () => useFeedback( { ...defaultConfig, messages } ) );
			await triggerFeedback( 'msg-3', 'down' );

			await act( async () => {
				await result.current.submitFeedbackText( 'Test' );
			} );

			const callData = JSON.parse( findFetchCall( '/text' )[ 1 ].body );
			expect( callData.previous_messages ).toHaveLength( 3 );
			expect( callData.previous_messages[ 2 ].text ).toBe( 'Here are your analytics' );
			expect( callData.previous_messages ).not.toContainEqual(
				expect.objectContaining( { text: expect.stringContaining( 'tool_id' ) } )
			);
			expect( callData.previous_messages[ 1 ].text ).toBe(
				'🔨 Tool: `big_sky__show_component` (site-analytics)'
			);
		} );
	} );
} );
