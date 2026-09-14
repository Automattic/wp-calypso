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

const latestComplete = { isLatestAgentMessage: true, isStreaming: false };

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

		expect( result.current( createMessage( 'agent-1', 'agent' ), latestComplete ) ).toEqual( [] );
		expect( getRegenerateHandler ).not.toHaveBeenCalled();
	} );

	it( 'returns no action when the handler getter is unavailable', () => {
		const { result } = renderHook( () =>
			useRegenerateAction( { enabled: true, getRegenerateHandler: undefined } )
		);

		expect( result.current( createMessage( 'agent-1', 'agent' ), latestComplete ) ).toEqual( [] );
	} );

	it( 'builds an enabled regenerate action for the latest completed agent message', () => {
		const { result } = renderHook( () =>
			useRegenerateAction( { enabled: true, getRegenerateHandler } )
		);

		const message = createMessage( 'agent-1', 'agent' );

		expect( result.current( message, latestComplete ) ).toEqual( [
			expect.objectContaining( {
				id: 'regenerate',
				label: 'Regenerate',
				tooltip: 'Regenerate response',
				onClick: onRegenerate,
				disabled: false,
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

	it( 'disables the action on older agent messages', () => {
		const { result } = renderHook( () =>
			useRegenerateAction( { enabled: true, getRegenerateHandler } )
		);

		const [ action ] = result.current( createMessage( 'agent-1', 'agent' ), {
			isLatestAgentMessage: false,
			isStreaming: false,
		} );

		expect( action ).toEqual(
			expect.objectContaining( { id: 'regenerate', disabled: true, onClick: onRegenerate } )
		);
	} );

	it( 'shows a disabled placeholder on the latest message while streaming', () => {
		// Mid-stream the turn is not yet regeneratable, so agenttic returns no handler.
		getRegenerateHandler.mockReturnValueOnce( null as unknown as typeof onRegenerate );

		const { result } = renderHook( () =>
			useRegenerateAction( { enabled: true, getRegenerateHandler } )
		);

		const [ action ] = result.current( createMessage( 'agent-1', 'agent' ), {
			isLatestAgentMessage: true,
			isStreaming: true,
		} );

		expect( action ).toEqual(
			expect.objectContaining( {
				id: 'regenerate',
				disabled: true,
				onClick: expect.any( Function ),
			} )
		);
	} );

	it( 'returns no action for a non-latest message with no handler', () => {
		getRegenerateHandler.mockReturnValueOnce( null as unknown as typeof onRegenerate );

		const { result } = renderHook( () =>
			useRegenerateAction( { enabled: true, getRegenerateHandler } )
		);

		expect(
			result.current( createMessage( 'agent-1', 'agent' ), {
				isLatestAgentMessage: false,
				isStreaming: true,
			} )
		).toEqual( [] );
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
