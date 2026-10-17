/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '../../stores', () => ( { AGENTS_MANAGER_STORE: 'automattic/agents-manager' } ) );
jest.mock( '@wordpress/data', () => ( { useSelect: jest.fn() } ) );
jest.mock( '../../utils/can-dock', () => ( {
	...jest.requireActual( '../../utils/can-dock' ),
	useCanDock: jest.fn( () => ( { canDock: true } ) ),
} ) );

import { renderHook } from '@testing-library/react';
import { useSelect } from '@wordpress/data';
import { useCanDock } from '../../utils/can-dock';
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

	it( 'reads the store again when the chat starts or stops being able to dock', () => {
		mockUseSelect.mockClear().mockReturnValue( { hasLoaded: true, isChatVisible: true } );

		const { rerender } = renderHook( () => useAiChatEntryState() );
		( useCanDock as jest.Mock ).mockReturnValue( { canDock: false } );
		rerender();

		expect( mockUseSelect.mock.calls.map( ( [ , deps ] ) => deps ) ).toEqual( [
			[ true ],
			[ false ],
		] );
	} );
} );
