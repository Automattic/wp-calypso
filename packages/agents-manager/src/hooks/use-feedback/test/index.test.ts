/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { renderHook, act } from '@testing-library/react';
import { getSessionId as getStoredSessionId } from '../../../utils/agent-session';
import useFeedback from '../index';
import type { Message } from '@automattic/agenttic-ui/dist/types';

jest.mock(
	'@automattic/agenttic-ui',
	() => {
		let onFeedbackCb: ( messageId: string, feedback: 'up' | 'down' ) => void;

		return {
			createFeedbackActions: jest.fn(
				( {
					onFeedback,
					condition,
				}: {
					onFeedback: ( messageId: string, feedback: 'up' | 'down' ) => void;
					condition?: ( message: Message ) => boolean;
				} ) => {
					onFeedbackCb = onFeedback;
					return {
						getActionsForMessage: ( message: Message ) => {
							if ( condition && ! condition( message ) ) {
								return [];
							}
							return [
								{
									id: 'feedback-up',
									label: 'Thumbs Up',
									onClick: ( msg: Message ) => onFeedbackCb( msg.id, 'up' ),
								},
								{
									id: 'feedback-down',
									label: 'Thumbs Down',
									onClick: ( msg: Message ) => onFeedbackCb( msg.id, 'down' ),
								},
							];
						},
						onChange: jest.fn(),
						offChange: jest.fn(),
					};
				}
			),
			ThumbsUpIcon: () => null,
			ThumbsDownIcon: () => null,
		};
	},
	{ virtual: true }
);
jest.mock( '@automattic/calypso-analytics' );
jest.mock( '../../../utils/agent-session' );

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

describe( 'useFeedback', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockFetch.mockResolvedValue( { ok: true } );
		mockGetStoredSessionId.mockReturnValue( 'stored-session-123' );
	} );

	const defaultConfig = {
		registerMessageActions: mockRegisterMessageActions,
		messages: [],
		agentId: 'test-agent',
		sessionId: 'session-abc',
		authProvider: mockAuthProvider,
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

		it( 'only registers once', () => {
			const { rerender } = renderHook( () => useFeedback( defaultConfig ) );

			expect( mockRegisterMessageActions ).toHaveBeenCalledTimes( 1 );

			rerender();

			expect( mockRegisterMessageActions ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'resets registration when session changes', () => {
			const { rerender } = renderHook( ( props ) => useFeedback( props ), {
				initialProps: defaultConfig,
			} );

			expect( mockRegisterMessageActions ).toHaveBeenCalledTimes( 1 );

			rerender( { ...defaultConfig, sessionId: 'new-session' } );

			// Should trigger re-registration on next effect cycle
			expect( mockRegisterMessageActions ).toHaveBeenCalledTimes( 2 );
		} );
	} );

	describe( 'thumbs up feedback', () => {
		it( 'sends rating with message_text via fetch when thumbs up is clicked', async () => {
			const messages = [ createMessage( 'msg-1', 'agent', 'Here is the answer' ) ];
			renderHook( () => useFeedback( { ...defaultConfig, messages } ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( messages[ 0 ] );
			const thumbsUpAction = actions.find( ( a: { id: string } ) => a.id.includes( 'up' ) );

			await act( async () => {
				await thumbsUpAction?.onClick( messages[ 0 ] );
			} );

			expect( mockAuthProvider ).toHaveBeenCalled();
			expect( mockFetch ).toHaveBeenCalledWith(
				'https://public-api.wordpress.com/wpcom/v2/ai/feedback/session-abc/rate',
				expect.objectContaining( {
					method: 'POST',
					headers: expect.objectContaining( {
						Authorization: 'Bearer test-token',
					} ),
					body: JSON.stringify( {
						message_id: 'msg-1',
						rating: 'up',
						message_text: 'Here is the answer',
					} ),
				} )
			);
		} );

		it( 'records tracks event for thumbs up', async () => {
			renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsUpAction = actions.find( ( a: { id: string } ) => a.id.includes( 'up' ) );

			await act( async () => {
				await thumbsUpAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_agents_manager_response_feedback_action',
				{ type: 'thumb_up', message_id: 'msg-1' }
			);
		} );

		it( 'does not show feedback input after thumbs up', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsUpAction = actions.find( ( a: { id: string } ) => a.id.includes( 'up' ) );

			await act( async () => {
				await thumbsUpAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( result.current.showFeedbackInput ).toBe( false );
		} );
	} );

	describe( 'thumbs down feedback', () => {
		it( 'sends rating with message_text via fetch when thumbs down is clicked', async () => {
			const messages = [ createMessage( 'msg-1', 'agent', 'Bad answer' ) ];
			renderHook( () => useFeedback( { ...defaultConfig, messages } ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( messages[ 0 ] );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( messages[ 0 ] );
			} );

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

		it( 'records tracks event for thumbs down', async () => {
			renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_agents_manager_response_feedback_action',
				{ type: 'thumb_down', message_id: 'msg-1' }
			);
		} );

		it( 'shows feedback input after thumbs down', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

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

			// Simulate thumbs down first
			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-4', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-4', 'agent', 'Test' ) );
			} );

			// Submit feedback text
			await act( async () => {
				await result.current.submitFeedbackText( 'The solution was unclear' );
			} );

			const textCall = mockFetch.mock.calls.find(
				( call: string[] ) => typeof call[ 0 ] === 'string' && call[ 0 ].includes( '/text' )
			);
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

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-6', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-6', 'agent', 'Test' ) );
			} );

			await act( async () => {
				await result.current.submitFeedbackText( 'Test feedback' );
			} );

			// Find the feedback text submission call (the /text URL)
			const feedbackCall = mockFetch.mock.calls.find(
				( call: string[] ) => typeof call[ 0 ] === 'string' && call[ 0 ].includes( '/text' )
			);
			expect( feedbackCall ).toBeDefined();
			const callData = JSON.parse( feedbackCall[ 1 ].body );
			expect( callData.previous_messages ).toHaveLength( 4 );
			expect( callData.previous_messages[ 0 ].text ).toBe( 'Message 3' );
		} );

		it( 'records tracks event when feedback text is submitted', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			await act( async () => {
				await result.current.submitFeedbackText( 'Helpful feedback' );
			} );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'calypso_agents_manager_response_feedback_submitted',
				{ message_id: 'msg-1' }
			);
		} );

		it( 'uses stored session ID when sessionId prop is empty', async () => {
			const { result } = renderHook( () =>
				useFeedback( { ...defaultConfig, sessionId: undefined } )
			);

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			await act( async () => {
				await result.current.submitFeedbackText( 'Test' );
			} );

			const textCall = mockFetch.mock.calls.find(
				( call: string[] ) => typeof call[ 0 ] === 'string' && call[ 0 ].includes( '/text' )
			);
			expect( textCall ).toBeDefined();
			expect( textCall[ 0 ] ).toBe(
				'https://public-api.wordpress.com/wpcom/v2/ai/feedback/stored-session-123/text'
			);
		} );

		it( 'does not submit if feedback text is empty', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			// Clear mocks from rating call
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

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( result.current.showFeedbackInput ).toBe( true );

			act( () => {
				result.current.resetFeedback();
			} );

			expect( result.current.showFeedbackInput ).toBe( false );
		} );
	} );

	describe( 'no authProvider', () => {
		it( 'does not send rating when authProvider is not provided', async () => {
			renderHook( () => useFeedback( { ...defaultConfig, authProvider: undefined } ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsUpAction = actions.find( ( a: { id: string } ) => a.id.includes( 'up' ) );

			await act( async () => {
				await thumbsUpAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

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

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-3', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a: { id: string } ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-3', 'agent', 'Test' ) );
			} );

			await act( async () => {
				await result.current.submitFeedbackText( 'Test' );
			} );

			// Find the feedback text submission call (the /text URL)
			const feedbackCall = mockFetch.mock.calls.find(
				( call: string[] ) => typeof call[ 0 ] === 'string' && call[ 0 ].includes( '/text' )
			);
			expect( feedbackCall ).toBeDefined();
			const callData = JSON.parse( feedbackCall[ 1 ].body );
			expect( callData.previous_messages ).toHaveLength( 3 );
			expect( callData.previous_messages[ 2 ].text ).toBe( 'Here are your analytics' );
			// Tool JSON is replaced with a human-readable placeholder
			expect( callData.previous_messages ).not.toContainEqual(
				expect.objectContaining( { text: expect.stringContaining( 'tool_id' ) } )
			);
			expect( callData.previous_messages[ 1 ].text ).toBe(
				'🔨 Tool: `big_sky__show_component` (site-analytics)'
			);
		} );
	} );
} );
