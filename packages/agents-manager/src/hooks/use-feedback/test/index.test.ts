/**
 * @jest-environment jsdom
 */
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { renderHook, act } from '@testing-library/react';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { getSessionId as getStoredSessionId } from '../../../utils/agent-session';
import useFeedback from '../index';
import type { Message } from '@automattic/agenttic-ui/dist/types';

jest.mock( '@automattic/calypso-analytics' );
jest.mock( '@wordpress/api-fetch' );
jest.mock( 'wpcom-proxy-request' );
jest.mock( '../../../utils/agent-session' );

const mockRegisterMessageActions = jest.fn();
const mockRecordTracksEvent = recordTracksEvent as jest.MockedFunction< typeof recordTracksEvent >;
const mockApiFetch = apiFetch as jest.MockedFunction< typeof apiFetch >;
const mockWpcomRequest = wpcomRequest as jest.MockedFunction< typeof wpcomRequest >;
const mockCanAccessWpcomApis = canAccessWpcomApis as jest.MockedFunction<
	typeof canAccessWpcomApis
>;
const mockGetStoredSessionId = getStoredSessionId as jest.MockedFunction<
	typeof getStoredSessionId
>;

const createMessage = ( id: string, role: 'user' | 'agent', text: string ): Message => ( {
	id,
	role,
	content: [ { type: 'text', text } ],
} );

describe( 'useFeedback', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockCanAccessWpcomApis.mockReturnValue( true );
		mockWpcomRequest.mockResolvedValue( {} );
		mockApiFetch.mockResolvedValue( {} );
		mockGetStoredSessionId.mockReturnValue( 'stored-session-123' );
	} );

	const defaultConfig = {
		registerMessageActions: mockRegisterMessageActions,
		messages: [],
		agentId: 'test-agent',
		siteId: 12345,
		sessionId: 'session-abc',
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
		it( 'sends rating to wpcom when thumbs up is clicked', async () => {
			renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsUpAction = actions.find( ( a ) => a.id.includes( 'up' ) );

			await act( async () => {
				await thumbsUpAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( mockWpcomRequest ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sites/12345/big-sky/v1/wp-orchestrator/session-abc/rate',
					method: 'POST',
					body: { message_id: 'msg-1', rating: 'up' },
				} )
			);
		} );

		it( 'records tracks event for thumbs up', async () => {
			renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsUpAction = actions.find( ( a ) => a.id.includes( 'up' ) );

			await act( async () => {
				await thumbsUpAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'wpcom_agents_manager_response_action_thumbs_up',
				{ message_id: 'msg-1' }
			);
		} );

		it( 'does not show feedback input after thumbs up', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsUpAction = actions.find( ( a ) => a.id.includes( 'up' ) );

			await act( async () => {
				await thumbsUpAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( result.current.showFeedbackInput ).toBe( false );
			expect( result.current.feedbackMessageId ).toBeNull();
		} );
	} );

	describe( 'thumbs down feedback', () => {
		it( 'sends rating to wpcom when thumbs down is clicked', async () => {
			renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( mockWpcomRequest ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sites/12345/big-sky/v1/wp-orchestrator/session-abc/rate',
					method: 'POST',
					body: { message_id: 'msg-1', rating: 'down' },
				} )
			);
		} );

		it( 'records tracks event for thumbs down', async () => {
			renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'wpcom_agents_manager_response_action_thumbs_down',
				{ message_id: 'msg-1' }
			);
		} );

		it( 'shows feedback input after thumbs down', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( result.current.showFeedbackInput ).toBe( true );
			expect( result.current.feedbackMessageId ).toBe( 'msg-1' );
		} );
	} );

	describe( 'feedback text submission', () => {
		it( 'submits feedback with conversation context to wpcom', async () => {
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
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-4', 'agent', 'Test' ) );
			} );

			// Submit feedback text
			await act( async () => {
				await result.current.submitFeedbackText( 'The solution was unclear' );
			} );

			expect( mockWpcomRequest ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sites/12345/big-sky/v1/wp-orchestrator/session-abc/feedback',
					method: 'POST',
					body: expect.objectContaining( {
						message_id: 'msg-4',
						feedback: 'The solution was unclear',
						previous_messages: [
							{ role: 'user', text: 'How do I set up my site?' },
							{ role: 'agent', text: 'Here are the steps...' },
							{ role: 'user', text: 'That did not work' },
							{ role: 'agent', text: 'Let me try a different approach...' },
						],
					} ),
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
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-6', 'agent', 'Test' ) );
			} );

			await act( async () => {
				await result.current.submitFeedbackText( 'Test feedback' );
			} );

			const callBody = mockWpcomRequest.mock.calls[ 1 ][ 0 ].body;
			expect( callBody.previous_messages ).toHaveLength( 4 );
			expect( callBody.previous_messages[ 0 ].text ).toBe( 'Message 3' );
		} );

		it( 'records tracks event when feedback text is submitted', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			await act( async () => {
				await result.current.submitFeedbackText( 'Helpful feedback' );
			} );

			expect( mockRecordTracksEvent ).toHaveBeenCalledWith(
				'wpcom_agents_manager_response_feedback_submitted',
				{ message_id: 'msg-1' }
			);
		} );

		it( 'uses stored session ID when sessionId prop is empty', async () => {
			const { result } = renderHook( () =>
				useFeedback( { ...defaultConfig, sessionId: undefined } )
			);

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			await act( async () => {
				await result.current.submitFeedbackText( 'Test' );
			} );

			expect( mockWpcomRequest ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/sites/12345/big-sky/v1/wp-orchestrator/stored-session-123/feedback',
				} )
			);
		} );

		it( 'does not submit if feedback text is empty', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			// Clear mocks from rating call
			mockWpcomRequest.mockClear();

			await act( async () => {
				await result.current.submitFeedbackText( '   ' );
			} );

			expect( mockWpcomRequest ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'feedback cancellation', () => {
		it( 'hides feedback input when cancelled', async () => {
			const { result } = renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( result.current.showFeedbackInput ).toBe( true );

			act( () => {
				result.current.cancelFeedback();
			} );

			expect( result.current.showFeedbackInput ).toBe( false );
			expect( result.current.feedbackMessageId ).toBeNull();
		} );
	} );

	describe( 'API routing', () => {
		it( 'uses apiFetch when canAccessWpcomApis returns false', async () => {
			mockCanAccessWpcomApis.mockReturnValue( false );

			renderHook( () => useFeedback( defaultConfig ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-1', 'agent', 'Test' ) );
			const thumbsUpAction = actions.find( ( a ) => a.id.includes( 'up' ) );

			await act( async () => {
				await thumbsUpAction?.onClick( createMessage( 'msg-1', 'agent', 'Test' ) );
			} );

			expect( mockWpcomRequest ).not.toHaveBeenCalled();
			expect( mockApiFetch ).toHaveBeenCalledWith(
				expect.objectContaining( {
					path: '/wpcom/v2/big-sky/v1/wp-orchestrator/session-abc/rate',
					method: 'POST',
				} )
			);
		} );
	} );

	describe( 'conversation context extraction', () => {
		it( 'skips tool messages in conversation context', async () => {
			const messages = [
				createMessage( 'msg-1', 'user', 'Show me analytics' ),
				createMessage( 'msg-2', 'agent', '{"tool_id": "big_sky__show_component"}' ),
				createMessage( 'msg-3', 'agent', 'Here are your analytics' ),
			];

			const { result } = renderHook( () => useFeedback( { ...defaultConfig, messages } ) );

			const registrationCall = mockRegisterMessageActions.mock.calls[ 0 ][ 0 ];
			const actions = registrationCall.actions( createMessage( 'msg-3', 'agent', 'Test' ) );
			const thumbsDownAction = actions.find( ( a ) => a.id.includes( 'down' ) );

			await act( async () => {
				await thumbsDownAction?.onClick( createMessage( 'msg-3', 'agent', 'Test' ) );
			} );

			await act( async () => {
				await result.current.submitFeedbackText( 'Test' );
			} );

			const callBody = mockWpcomRequest.mock.calls[ 1 ][ 0 ].body;
			expect( callBody.previous_messages ).toHaveLength( 2 );
			expect( callBody.previous_messages[ 1 ].text ).toBe( 'Here are your analytics' );
			// Tool message replaced with placeholder
			expect( callBody.previous_messages ).not.toContainEqual(
				expect.objectContaining( { text: expect.stringContaining( 'tool_id' ) } )
			);
		} );
	} );
} );
