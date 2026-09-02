/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'automattic/agents-manager' } ) );
jest.mock( '@wordpress/data', () => ( { useSelect: jest.fn() } ) );

import { renderHook } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useAiChatEntryState } from '../use-ai-chat-entry-state';

type ChatState = { hasLoaded: boolean; isChatVisible: boolean };

const mockUseSelect = useSelect as jest.Mock;

// Runs the hook's selector against a store exposing `getAgentsManagerState`.
const mockStoreState = ( state: ChatState ) =>
	mockUseSelect.mockImplementation( ( mapSelect ) =>
		mapSelect( () => ( { getAgentsManagerState: () => state } ) )
	);

describe( 'useAiChatEntryState', () => {
	const cases: Array< [ string, ChatState, ReturnType< typeof useAiChatEntryState > ] > = [
		[
			'hidden',
			{ hasLoaded: true, isChatVisible: false },
			{ isChatVisible: false, isLabelVisible: true },
		],
		[
			'visible',
			{ hasLoaded: true, isChatVisible: true },
			{ isChatVisible: true, isLabelVisible: false },
		],
		[
			'hidden but the persisted state has not loaded',
			{ hasLoaded: false, isChatVisible: false },
			{ isChatVisible: false, isLabelVisible: false },
		],
	];

	it.each( cases )(
		'derives the entry state while the chat is %s',
		( _state, storeState, expected ) => {
			mockStoreState( storeState );

			const { result } = renderHook( () => useAiChatEntryState() );

			expect( result.current ).toEqual( expected );
		}
	);
} );
