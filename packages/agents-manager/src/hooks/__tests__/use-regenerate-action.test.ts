/**
 * @jest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import useRegenerateAction from '../use-regenerate-action';
import type { UIMessage } from '@automattic/agenttic-client';

jest.mock(
	'@automattic/agenttic-ui',
	() => ( {
		RegenerateAltIcon: () => null,
	} ),
	{ virtual: true }
);

const createMessage = ( id: string, role: 'user' | 'agent' ): UIMessage => ( {
	id,
	role,
	content: [ { type: 'text', text: 'Message text' } ],
	timestamp: Date.now(),
	archived: false,
	showIcon: true,
} );

describe( 'useRegenerateAction', () => {
	const onRegenerate = jest.fn();
	const getRegenerateHandler = jest.fn( () => onRegenerate );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns no action when disabled', () => {
		const { result } = renderHook( () =>
			useRegenerateAction( { enabled: false, getRegenerateHandler } )
		);

		expect( result.current( createMessage( 'agent-1', 'agent' ) ) ).toEqual( [] );
		expect( getRegenerateHandler ).not.toHaveBeenCalled();
	} );

	it( 'returns no action when the handler getter is unavailable', () => {
		const { result } = renderHook( () =>
			useRegenerateAction( { enabled: true, getRegenerateHandler: undefined } )
		);

		expect( result.current( createMessage( 'agent-1', 'agent' ) ) ).toEqual( [] );
	} );

	it( 'builds the regenerate action when agenttic hands out a handler for the message', () => {
		const { result } = renderHook( () =>
			useRegenerateAction( { enabled: true, getRegenerateHandler } )
		);

		const message = createMessage( 'agent-1', 'agent' );

		expect( result.current( message ) ).toEqual( [
			expect.objectContaining( {
				id: 'regenerate',
				label: 'Regenerate',
				tooltip: 'Regenerate response',
				onClick: onRegenerate,
				icon: expect.objectContaining( {
					props: expect.objectContaining( {
						className: 'agents-manager-message-action-icon',
					} ),
				} ),
				order: 3.5,
			} ),
		] );
		expect( getRegenerateHandler ).toHaveBeenCalledWith( message );
	} );

	it( 'returns no action when agenttic has no handler for the message', () => {
		// No handler when agenttic cannot rebuild history up to this message.
		getRegenerateHandler.mockReturnValueOnce( null as unknown as typeof onRegenerate );

		const { result } = renderHook( () =>
			useRegenerateAction( { enabled: true, getRegenerateHandler } )
		);

		expect( result.current( createMessage( 'agent-1', 'agent' ) ) ).toEqual( [] );
	} );

	it( 'keeps the getter stable while its inputs are unchanged', () => {
		const { result, rerender } = renderHook( () =>
			useRegenerateAction( { enabled: true, getRegenerateHandler } )
		);

		const firstGetter = result.current;
		rerender();

		expect( result.current ).toBe( firstGetter );
	} );
} );
