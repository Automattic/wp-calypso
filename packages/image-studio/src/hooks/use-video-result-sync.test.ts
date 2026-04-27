/**
 * Tests for useVideoResultSync hook
 *
 * Verifies the hook lifts the URL from a successful video tool result into the
 * dedicated video-studio store. Tool results are read from the agent manager's
 * raw conversation history (the `useAgentChat` UI message list strips them).
 */
/* eslint-disable import/order */
import { renderHook } from '@testing-library/react';

const mockSetCurrentVideoUrl = jest.fn();
const mockHasAgent = jest.fn();
const mockGetConversationHistory = jest.fn();

jest.mock( '@wordpress/element', () => ( {
	useEffect: ( fn: () => void ) => fn(),
	useRef: ( initial: unknown ) => ( { current: initial } ),
} ) );

jest.mock( '@wordpress/data', () => ( {
	useDispatch: () => ( { setCurrentVideoUrl: mockSetCurrentVideoUrl } ),
	createReduxStore: jest.fn( ( storeName: string, config: Record< string, unknown > ) => ( {
		name: storeName,
		...config,
	} ) ),
	register: jest.fn(),
	select: jest.fn( () => null ),
} ) );

jest.mock(
	'@automattic/agenttic-client',
	() => ( {
		getAgentManager: () => ( {
			hasAgent: mockHasAgent,
			getConversationHistory: mockGetConversationHistory,
		} ),
	} ),
	{ virtual: true }
);

import { useVideoResultSync } from './use-video-result-sync';

const AGENT_ID = 'wp-orchestrator';

const buildToolResultMessage = (
	toolId: string,
	result: { url?: string; attachmentId?: number } | undefined
) => ( {
	role: 'agent',
	messageId: 'msg-1',
	parts: [
		{
			type: 'data',
			data: { toolCallId: 'call-1', toolId, result },
		},
	],
} );

describe( 'useVideoResultSync', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockHasAgent.mockReturnValue( true );
	} );

	it( 'no-ops when no agentId is provided', () => {
		mockGetConversationHistory.mockReturnValue( [] );
		renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], undefined ) );
		expect( mockSetCurrentVideoUrl ).not.toHaveBeenCalled();
	} );

	it( 'no-ops when the agent manager has no agent registered', () => {
		mockHasAgent.mockReturnValue( false );
		renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], AGENT_ID ) );
		expect( mockSetCurrentVideoUrl ).not.toHaveBeenCalled();
	} );

	it( 'no-ops when conversation history is empty', () => {
		mockGetConversationHistory.mockReturnValue( [] );
		renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], AGENT_ID ) );
		expect( mockSetCurrentVideoUrl ).not.toHaveBeenCalled();
	} );

	it( 'dispatches setCurrentVideoUrl for slash-namespaced tool result', () => {
		mockGetConversationHistory.mockReturnValue( [
			buildToolResultMessage( 'wpcom/generate-video-for-studio', {
				url: 'https://files.wordpress.com/clip.mp4',
				attachmentId: 42,
			} ),
		] );

		renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], AGENT_ID ) );

		expect( mockSetCurrentVideoUrl ).toHaveBeenCalledTimes( 1 );
		expect( mockSetCurrentVideoUrl ).toHaveBeenCalledWith( 'https://files.wordpress.com/clip.mp4' );
	} );

	it( 'dispatches setCurrentVideoUrl for double-underscore-namespaced tool result', () => {
		mockGetConversationHistory.mockReturnValue( [
			buildToolResultMessage( 'wpcom__generate_video_for_studio', {
				url: 'https://files.wordpress.com/clip.mp4',
				attachmentId: 42,
			} ),
		] );

		renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], AGENT_ID ) );

		expect( mockSetCurrentVideoUrl ).toHaveBeenCalledWith( 'https://files.wordpress.com/clip.mp4' );
	} );

	it( 'ignores tool results from unrelated tools', () => {
		mockGetConversationHistory.mockReturnValue( [
			buildToolResultMessage( 'wpcom/generate-image', {
				url: 'https://files.wordpress.com/image.png',
				attachmentId: 7,
			} ),
		] );

		renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], AGENT_ID ) );

		expect( mockSetCurrentVideoUrl ).not.toHaveBeenCalled();
	} );

	it( 'ignores results without a positive attachmentId', () => {
		mockGetConversationHistory.mockReturnValue( [
			buildToolResultMessage( 'wpcom/generate-video-for-studio', {
				url: 'https://files.wordpress.com/clip.mp4',
				attachmentId: 0,
			} ),
		] );

		renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], AGENT_ID ) );

		expect( mockSetCurrentVideoUrl ).not.toHaveBeenCalled();
	} );

	it( 'ignores results without a url', () => {
		mockGetConversationHistory.mockReturnValue( [
			buildToolResultMessage( 'wpcom/generate-video-for-studio', {
				attachmentId: 42,
			} ),
		] );

		renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], AGENT_ID ) );

		expect( mockSetCurrentVideoUrl ).not.toHaveBeenCalled();
	} );

	it( 'prefers the most recent successful video result', () => {
		mockGetConversationHistory.mockReturnValue( [
			buildToolResultMessage( 'wpcom/generate-video-for-studio', {
				url: 'https://files.wordpress.com/old.mp4',
				attachmentId: 1,
			} ),
			buildToolResultMessage( 'wpcom/generate-video-for-studio', {
				url: 'https://files.wordpress.com/new.mp4',
				attachmentId: 2,
			} ),
		] );

		renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], AGENT_ID ) );

		expect( mockSetCurrentVideoUrl ).toHaveBeenCalledTimes( 1 );
		expect( mockSetCurrentVideoUrl ).toHaveBeenCalledWith( 'https://files.wordpress.com/new.mp4' );
	} );

	it( 'survives an agent manager that throws', () => {
		mockHasAgent.mockImplementation( () => {
			throw new Error( 'boom' );
		} );

		expect( () =>
			renderHook( () => useVideoResultSync( [ { id: 'm1', role: 'agent' } ], AGENT_ID ) )
		).not.toThrow();
		expect( mockSetCurrentVideoUrl ).not.toHaveBeenCalled();
	} );
} );
