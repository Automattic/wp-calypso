import { renderHook } from '@testing-library/react';
import { type Mock, vi } from 'vitest';
import { useOdieAssistantContext } from '../../context';
import { useTrackChatPanelClosed } from '../use-track-chat-panel-closed';

const mockTrackEvent = vi.fn();
let mockIsHelpCenterShown = false;

const mockRegistry = { select: () => ( { isHelpCenterShown: () => mockIsHelpCenterShown } ) };

vi.mock( '@wordpress/data', () => ( { useRegistry: () => mockRegistry } ) );
vi.mock( '@automattic/zendesk-client', () => ( {} ) );
vi.mock( '../../constants', () => ( { HELP_CENTER_STORE: 'automattic/help-center' } ) );
vi.mock( '../../context', () => ( { useOdieAssistantContext: vi.fn() } ) );
vi.mock( '../use-is-pending-direct-chat', () => ( { useIsPendingDirectChat: () => false } ) );

beforeEach( () => {
	vi.clearAllMocks();
	( useOdieAssistantContext as Mock ).mockReturnValue( {
		chat: { provider: 'zendesk', status: 'loaded', conversationId: 'conv-1', messages: [] },
		trackEvent: mockTrackEvent,
	} );
} );

describe( 'useTrackChatPanelClosed', () => {
	it( 'records the chat state when the panel closes', () => {
		const { unmount } = renderHook( () => useTrackChatPanelClosed() );
		mockIsHelpCenterShown = false;

		unmount();

		expect( mockTrackEvent ).toHaveBeenCalledTimes( 1 );
		expect( mockTrackEvent ).toHaveBeenCalledWith( 'chat_panel_closed', {
			chat_state: 'waiting_for_agent',
			conversation_id: 'conv-1',
		} );
	} );

	// The chat also unmounts when the user moves to another Help Center page, which isn't a close.
	it( 'records nothing when the panel is still shown', () => {
		const { unmount } = renderHook( () => useTrackChatPanelClosed() );
		mockIsHelpCenterShown = true;

		unmount();

		expect( mockTrackEvent ).not.toHaveBeenCalled();
	} );
} );
