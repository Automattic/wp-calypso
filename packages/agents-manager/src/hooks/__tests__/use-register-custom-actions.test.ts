/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useRegisterCustomActions from '../use-setup-custom-actions/use-register-custom-actions';

describe( 'useRegisterCustomActions', () => {
	beforeEach( () => {
		delete window.__agentsManagerActions;
	} );

	it( 'registers each action on window.__agentsManagerActions', () => {
		const setChatInput = jest.fn();
		const submitChatMessage = jest.fn();

		renderHook( () => useRegisterCustomActions( { setChatInput, submitChatMessage } ) );

		expect( window.__agentsManagerActions?.setChatInput ).toBe( setChatInput );
		expect( window.__agentsManagerActions?.submitChatMessage ).toBe( submitChatMessage );
	} );

	it( 'cleans up only its own keys on unmount', () => {
		const setChatInput = jest.fn();
		// Pre-populate an unrelated action that the hook must not touch.
		window.__agentsManagerActions = {
			setContextEntry: jest.fn(),
		} as unknown as AgentsManagerActions;
		const externalSetContextEntry = window.__agentsManagerActions.setContextEntry;

		const { unmount } = renderHook( () => useRegisterCustomActions( { setChatInput } ) );
		unmount();

		expect( window.__agentsManagerActions?.setChatInput ).toBeUndefined();
		expect( window.__agentsManagerActions?.setContextEntry ).toBe( externalSetContextEntry );
	} );

	it( 'leaves a replacement value alone when the effect re-runs', () => {
		const first = jest.fn();
		const second = jest.fn();

		const { rerender } = renderHook(
			( { fn } ) => useRegisterCustomActions( { setChatInput: fn } ),
			{
				initialProps: { fn: first },
			}
		);
		expect( window.__agentsManagerActions?.setChatInput ).toBe( first );

		rerender( { fn: second } );
		expect( window.__agentsManagerActions?.setChatInput ).toBe( second );
	} );

	it( 'does not delete a key that another consumer has overwritten', () => {
		const ours = jest.fn();
		const theirs = jest.fn();

		const { unmount } = renderHook( () => useRegisterCustomActions( { setChatInput: ours } ) );
		// Simulate another consumer replacing our value before we unmount.
		( window.__agentsManagerActions as AgentsManagerActions ).setChatInput = theirs;

		unmount();

		expect( window.__agentsManagerActions?.setChatInput ).toBe( theirs );
	} );
} );
