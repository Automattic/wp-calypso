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
	const registerMessageActions = jest.fn();
	const unregisterMessageActions = jest.fn();
	const onRegenerate = jest.fn();
	const getRegenerateHandler = jest.fn( () => onRegenerate );

	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'does not register the action until enabled', () => {
		renderHook( () =>
			useRegenerateAction( {
				enabled: false,
				isProcessing: false,
				registerMessageActions,
				unregisterMessageActions,
				getRegenerateHandler,
			} )
		);

		expect( registerMessageActions ).not.toHaveBeenCalled();
		expect( unregisterMessageActions ).toHaveBeenCalledWith( 'agents-manager-regenerate' );
	} );

	it( 'builds the regenerate action spec from the handler', () => {
		renderHook( () =>
			useRegenerateAction( {
				enabled: true,
				isProcessing: false,
				registerMessageActions,
				unregisterMessageActions,
				getRegenerateHandler,
			} )
		);

		expect( registerMessageActions ).toHaveBeenCalledWith( {
			id: 'agents-manager-regenerate',
			actions: expect.any( Function ),
		} );

		const registration = registerMessageActions.mock.calls[ 0 ][ 0 ];
		const message = createMessage( 'agent-1', 'agent' );

		expect( registration.actions( message ) ).toEqual( [
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

	it( 'returns no action when the message is not regeneratable', () => {
		getRegenerateHandler.mockReturnValueOnce( null as unknown as typeof onRegenerate );

		renderHook( () =>
			useRegenerateAction( {
				enabled: true,
				isProcessing: false,
				registerMessageActions,
				unregisterMessageActions,
				getRegenerateHandler,
			} )
		);

		const registration = registerMessageActions.mock.calls[ 0 ][ 0 ];
		const message = createMessage( 'user-1', 'user' );

		expect( registration.actions( message ) ).toEqual( [] );
	} );

	it( 'does not register the action when the handler getter is unavailable', () => {
		renderHook( () =>
			useRegenerateAction( {
				enabled: true,
				isProcessing: false,
				registerMessageActions,
				unregisterMessageActions,
				getRegenerateHandler: undefined,
			} )
		);

		expect( registerMessageActions ).not.toHaveBeenCalled();
		expect( unregisterMessageActions ).toHaveBeenCalledWith( 'agents-manager-regenerate' );
	} );

	it( 'refreshes registration when processing state changes', () => {
		const { rerender } = renderHook(
			( { isProcessing } ) =>
				useRegenerateAction( {
					enabled: true,
					isProcessing,
					registerMessageActions,
					unregisterMessageActions,
					getRegenerateHandler,
				} ),
			{ initialProps: { isProcessing: true } }
		);

		rerender( { isProcessing: false } );

		expect( registerMessageActions ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'unregisters the action on unmount', () => {
		const { unmount } = renderHook( () =>
			useRegenerateAction( {
				enabled: true,
				isProcessing: false,
				registerMessageActions,
				unregisterMessageActions,
				getRegenerateHandler,
			} )
		);

		unmount();

		expect( unregisterMessageActions ).toHaveBeenCalledWith( 'agents-manager-regenerate' );
	} );
} );
