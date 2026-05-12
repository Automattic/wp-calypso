/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useReaderFollowupSuggestions } from '../reader-followup-hook';

// reader-followup-hook imports from @wordpress/element, mock it with the real React
// hooks so the hook behaviour is actually exercised.
jest.mock(
	'@wordpress/element',
	() => ( {
		useState: jest.requireActual( 'react' ).useState,
		useEffect: jest.requireActual( 'react' ).useEffect,
	} ),
	{ virtual: true }
);

type FollowupWindow = Window & {
	__jetpackReaderFollowupChips?: Array< { id: string; label: string; prompt?: string } >;
};

function getSuggestions( result: { current: ReturnType< typeof useReaderFollowupSuggestions > } ) {
	return result.current?.suggestions ?? [];
}

describe( 'useReaderFollowupSuggestions', () => {
	afterEach( () => {
		// Clean up global state between tests.
		delete ( window as FollowupWindow ).__jetpackReaderFollowupChips;
	} );

	it( 'returns an empty suggestions array when the global is not set', () => {
		delete ( window as FollowupWindow ).__jetpackReaderFollowupChips;

		const { result } = renderHook( () => useReaderFollowupSuggestions() );

		expect( getSuggestions( result ) ).toEqual( [] );
	} );

	it( 'returns existing chips on mount when the global is already populated', () => {
		const chips = [
			{ id: 'chip-1', label: 'Tell me more', prompt: 'Tell me more about this.' },
			{ id: 'chip-2', label: 'Related posts', prompt: 'What are related posts?' },
		];
		( window as FollowupWindow ).__jetpackReaderFollowupChips = chips;

		const { result } = renderHook( () => useReaderFollowupSuggestions() );

		expect( getSuggestions( result ) ).toEqual( chips );
	} );

	it( 'updates state when the `reader-chat-followups-updated` event fires', () => {
		delete ( window as FollowupWindow ).__jetpackReaderFollowupChips;

		const { result } = renderHook( () => useReaderFollowupSuggestions() );

		expect( getSuggestions( result ) ).toEqual( [] );

		const newChips = [ { id: 'followup-1', label: 'Go deeper', prompt: 'Expand on this.' } ];

		act( () => {
			( window as FollowupWindow ).__jetpackReaderFollowupChips = newChips;
			window.dispatchEvent( new Event( 'reader-chat-followups-updated' ) );
		} );

		expect( getSuggestions( result ) ).toEqual( newChips );
	} );

	it( 'removes the event listener on unmount', () => {
		const removeListenerSpy = jest.spyOn( window, 'removeEventListener' );

		const { unmount } = renderHook( () => useReaderFollowupSuggestions() );

		unmount();

		expect( removeListenerSpy ).toHaveBeenCalledWith(
			'reader-chat-followups-updated',
			expect.any( Function )
		);

		removeListenerSpy.mockRestore();
	} );

	it( 'reflects the latest global value each time the event fires', () => {
		const { result } = renderHook( () => useReaderFollowupSuggestions() );

		const first = [ { id: 'a', label: 'First', prompt: 'First prompt' } ];
		const second = [ { id: 'b', label: 'Second', prompt: 'Second prompt' } ];

		act( () => {
			( window as FollowupWindow ).__jetpackReaderFollowupChips = first;
			window.dispatchEvent( new Event( 'reader-chat-followups-updated' ) );
		} );

		expect( getSuggestions( result ) ).toEqual( first );

		act( () => {
			( window as FollowupWindow ).__jetpackReaderFollowupChips = second;
			window.dispatchEvent( new Event( 'reader-chat-followups-updated' ) );
		} );

		expect( getSuggestions( result ) ).toEqual( second );
	} );
} );
