/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'automattic/agents-manager' } ) );
jest.mock( '@wordpress/data', () => ( { useSelect: jest.fn() } ) );

import { renderHook } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useAiChatEntryState } from '../use-ai-chat-entry-state';

const mockUseSelect = useSelect as jest.Mock;

describe( 'useAiChatEntryState', () => {
	it( 'picks whether the persisted state has loaded and the chat is showing from the store', () => {
		const storeState = { hasLoaded: true, isOpen: true, isMinimized: true, isChatVisible: false };
		mockUseSelect.mockImplementation( ( mapSelect ) =>
			mapSelect( () => ( { getAgentsManagerState: () => storeState } ) )
		);

		const { result } = renderHook( () => useAiChatEntryState() );

		expect( result.current ).toEqual( { hasLoaded: true, isChatVisible: false } );
	} );
} );
