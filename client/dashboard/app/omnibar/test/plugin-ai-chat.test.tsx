/**
 * @jest-environment jsdom
 */
import {
	closeAgentsManagerChat,
	isAgentsManagerChatVisible,
	openAgentsManagerChat,
	recordFullNameAgentsManagerTracksEvent,
	useShouldUseUnifiedAgent,
} from '@automattic/agents-manager';
import { renderHook } from '@testing-library/react';
import { useAiChatPlugin } from '../plugin-ai-chat';

jest.mock( '@automattic/agents-manager', () => ( {
	closeAgentsManagerChat: jest.fn(),
	isAgentsManagerChatVisible: jest.fn( () => false ),
	openAgentsManagerChat: jest.fn(),
	recordFullNameAgentsManagerTracksEvent: jest.fn(),
	useShouldUseUnifiedAgent: jest.fn( () => true ),
} ) );

const mockIsChatVisible = isAgentsManagerChatVisible as jest.MockedFunction<
	typeof isAgentsManagerChatVisible
>;
const mockUseShouldUseUnifiedAgent = useShouldUseUnifiedAgent as jest.MockedFunction<
	typeof useShouldUseUnifiedAgent
>;

describe( 'useAiChatPlugin', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		mockIsChatVisible.mockReturnValue( false );
		mockUseShouldUseUnifiedAgent.mockReturnValue( true );
	} );

	it( 'returns no node when the unified agent is unavailable', () => {
		mockUseShouldUseUnifiedAgent.mockReturnValue( false );

		const { result } = renderHook( () => useAiChatPlugin( { sectionName: 'sites' } ) );

		expect( result.current ).toBeUndefined();
	} );

	it( 'records the masterbar event with the section and opens the chat on click', () => {
		const { result } = renderHook( () => useAiChatPlugin( { sectionName: 'sites' } ) );
		result.current?.onClick?.();

		expect( recordFullNameAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_masterbar_agents_manager_ai_chat_clicked',
			{ section: 'sites', action: 'open' }
		);
		expect( openAgentsManagerChat ).toHaveBeenCalled();
		expect( closeAgentsManagerChat ).not.toHaveBeenCalled();
	} );

	it( 'records an unknown section and closes a visible chat on click', () => {
		mockIsChatVisible.mockReturnValue( true );

		const { result } = renderHook( () => useAiChatPlugin( {} ) );
		result.current?.onClick?.();

		expect( recordFullNameAgentsManagerTracksEvent ).toHaveBeenCalledWith(
			'calypso_masterbar_agents_manager_ai_chat_clicked',
			{ section: 'unknown', action: 'close' }
		);
		expect( closeAgentsManagerChat ).toHaveBeenCalled();
		expect( openAgentsManagerChat ).not.toHaveBeenCalled();
	} );
} );
