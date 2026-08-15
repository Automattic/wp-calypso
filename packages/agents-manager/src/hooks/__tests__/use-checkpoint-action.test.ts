/**
 * @jest-environment jsdom
 */
import {
	act,
	fireEvent,
	render,
	renderHook,
	screen,
	waitFor,
	within,
} from '@testing-library/react';
import { createElement } from '@wordpress/element';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import useCheckpointAction, {
	invalidateCheckpointAction,
	setCheckpointActionReverted,
} from '../use-checkpoint-action';
import type { UseCheckpointReturn } from '../../utils/load-external-providers';
import type { UIMessage, UseAgentChatReturn } from '@automattic/agenttic-client';

jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: jest.fn(),
} ) );
jest.mock( '@wordpress/icons', () => {
	const { createElement: mockCreateElement } = jest.requireActual( '@wordpress/element' );

	return {
		check: 'check',
		closeSmall: 'closeSmall',
		redo: 'redo',
		undo: 'undo',
		Icon: ( { className, icon }: { className?: string; icon: unknown } ) => {
			if ( typeof icon !== 'string' ) {
				throw new Error( 'Unexpected unmocked icon' );
			}

			return mockCreateElement( 'span', {
				className,
				'data-testid': `icon-${ icon }`,
			} );
		},
	};
} );

type MessageActionsRegistration = Parameters< UseAgentChatReturn[ 'registerMessageActions' ] >[ 0 ];

function createToolMessage( {
	toolCallId,
	toolId = 'big_sky__apply_block_edits',
	data,
}: {
	toolCallId?: string;
	toolId?: string;
	data: Record< string, unknown >;
} ): UIMessage {
	return {
		id: 'message-1',
		role: 'agent',
		content: [
			{
				type: 'text',
				text: JSON.stringify( {
					tool_call_id: toolCallId,
					tool_id: toolId,
					data,
				} ),
			},
		],
	} as UIMessage;
}

function getActions( registration: MessageActionsRegistration | undefined, message: UIMessage ) {
	if ( ! registration ) {
		return [];
	}

	return typeof registration.actions === 'function'
		? registration.actions( message )
		: registration.actions;
}

function createCheckpoint(): UseCheckpointReturn {
	return {
		getLastEditorState: jest.fn(),
		setCheckpoint: jest.fn(),
		addCheckpointKeys: jest.fn(),
		restoreCheckpoint: jest.fn().mockResolvedValue( undefined ),
		addNewPageToCheckpoint: jest.fn(),
		addPageRenameToCheckpoint: jest.fn(),
		addPageRemovalToCheckpoint: jest.fn(),
		getLatestUserMessageId: jest.fn(),
		clearCheckpoint: jest.fn(),
		hasCheckpoint: jest.fn().mockReturnValue( true ),
	};
}

describe( 'useCheckpointAction', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );
	afterEach( () => {
		jest.restoreAllMocks();
	} );

	it( 'shows Reverted and removes Undo after restoring a successful block edit', async () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		let resolveRestore!: () => void;
		( checkpoint.restoreCheckpoint as jest.Mock ).mockImplementation(
			() =>
				new Promise< void >( ( resolve ) => {
					resolveRestore = resolve;
				} )
		);
		const message = createToolMessage( {
			toolCallId: 'tool-call-1',
			data: {
				result: {
					success: true,
					message: 'Corrected the grammar.',
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );

		renderHook( () => useCheckpointAction( registerMessageActions, checkpoint ) );

		const actions = getActions( registration, message );
		expect( actions ).toHaveLength( 1 );
		expect( actions[ 0 ] ).toMatchObject( {
			type: 'component',
			id: 'checkpoint',
			label: 'Updated and Undo',
		} );

		if ( actions[ 0 ]?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		render( createElement( actions[ 0 ].component, actions[ 0 ].componentProps ) );
		const status = screen.getByRole( 'status' );
		expect( status ).toHaveTextContent( 'Updated' );
		expect( within( status ).getByTestId( 'icon-check' ) ).toBeInTheDocument();
		expect( status ).not.toHaveClass( 'agents-manager-resolved-edit-action__status--reverted' );
		const undoButton = screen.getByRole( 'button', { name: 'Undo' } );
		fireEvent.click( undoButton );

		expect( checkpoint.restoreCheckpoint ).toHaveBeenCalledWith( 'tool-call-1' );
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
		expect( undoButton ).toBeDisabled();
		expect( status ).toHaveTextContent( 'Updated' );
		expect( within( status ).getByTestId( 'icon-check' ) ).toBeInTheDocument();
		expect( status ).not.toHaveClass( 'agents-manager-resolved-edit-action__status--reverted' );
		fireEvent.click( undoButton );
		expect( checkpoint.restoreCheckpoint ).toHaveBeenCalledTimes( 1 );

		await act( async () => resolveRestore() );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'restore_checkpoint_action', {
			action: 'undo',
			id: 'tool-call-1',
			outcome: 'success',
		} );
		expect( screen.queryByRole( 'button', { name: 'Undo' } ) ).not.toBeInTheDocument();
		expect( status ).toHaveTextContent( 'Reverted' );
		expect( within( status ).getByTestId( 'icon-closeSmall' ) ).toBeInTheDocument();
		expect( status ).toHaveClass( 'agents-manager-resolved-edit-action__status--reverted' );
		expect( getActions( registration, message )[ 0 ] ).toMatchObject( {
			label: 'Reverted',
		} );
	} );

	it( 'updates a mounted resolved edit action from external checkpoint state', () => {
		const registerMessageActions = jest.fn() as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		const message = createToolMessage( {
			toolCallId: 'native-status-tool-call',
			data: {
				result: {
					success: true,
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );
		const { result } = renderHook( () =>
			useCheckpointAction( registerMessageActions, checkpoint )
		);
		const updatedAction = result.current( message )[ 0 ];
		if ( updatedAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		const view = render( createElement( updatedAction.component, updatedAction.componentProps ) );

		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Updated' );
		expect( screen.getByRole( 'button', { name: 'Undo' } ) ).toBeInTheDocument();

		expect( setCheckpointActionReverted( 'native-status-tool-call', true ) ).toBe( true );
		invalidateCheckpointAction( 'native-status-tool-call' );
		const revertedAction = result.current( message )[ 0 ];
		expect( revertedAction ).toMatchObject( { label: 'Reverted' } );
		if ( revertedAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		view.rerender( createElement( revertedAction.component, revertedAction.componentProps ) );

		const status = screen.getByRole( 'status' );
		expect( status ).toHaveTextContent( 'Reverted' );
		expect( within( status ).getByTestId( 'icon-closeSmall' ) ).toBeInTheDocument();
		expect( status ).toHaveClass( 'agents-manager-resolved-edit-action__status--reverted' );
		expect( screen.queryByRole( 'button', { name: 'Undo' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Redo' } ) ).not.toBeInTheDocument();
	} );

	it( 're-enables Undo when restoring the checkpoint fails', async () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		let rejectRestore!: ( error: Error ) => void;
		( checkpoint.restoreCheckpoint as jest.Mock )
			.mockImplementationOnce(
				() =>
					new Promise< void >( ( _resolve, reject ) => {
						rejectRestore = reject;
					} )
			)
			.mockResolvedValueOnce( undefined );
		const consoleError = jest.spyOn( console, 'error' ).mockImplementation();
		const message = createToolMessage( {
			toolCallId: 'tool-call-failure',
			data: {
				result: {
					success: true,
					message: 'Corrected the grammar.',
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );

		renderHook( () => useCheckpointAction( registerMessageActions, checkpoint ) );

		const actions = getActions( registration, message );
		if ( actions[ 0 ]?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		render( createElement( actions[ 0 ].component, actions[ 0 ].componentProps ) );
		const status = screen.getByRole( 'status' );
		const undoButton = screen.getByRole( 'button', { name: 'Undo' } );
		fireEvent.click( undoButton );
		expect( undoButton ).toBeDisabled();

		await act( async () => rejectRestore( new Error( 'Restore failed' ) ) );

		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenLastCalledWith( 'restore_checkpoint_action', {
			action: 'undo',
			id: 'tool-call-failure',
			outcome: 'failed',
		} );
		expect( undoButton ).toBeEnabled();
		expect( status ).toHaveTextContent( 'Updated' );
		expect( status ).not.toHaveClass( 'agents-manager-resolved-edit-action__status--reverted' );
		expect( consoleError ).toHaveBeenCalledWith(
			'[useCheckpointAction] Failed to restore checkpoint:',
			expect.any( Error )
		);

		fireEvent.click( undoButton );
		expect( checkpoint.restoreCheckpoint ).toHaveBeenCalledTimes( 2 );
		expect( undoButton ).toBeDisabled();
		await waitFor( () => expect( status ).toHaveTextContent( 'Reverted' ) );
		expect( screen.queryByRole( 'button', { name: 'Undo' } ) ).not.toBeInTheDocument();
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( 2 );
		expect( recordBigSkyTracksEvent ).toHaveBeenLastCalledWith( 'restore_checkpoint_action', {
			action: 'undo',
			id: 'tool-call-failure',
			outcome: 'success',
		} );
	} );

	it( 'swaps a text checkpoint between Undo and Redo', async () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		checkpoint.canSwapCheckpoint = jest.fn().mockReturnValue( true );
		checkpoint.swapCheckpoint = jest.fn().mockResolvedValue( undefined );
		const message = createToolMessage( {
			toolCallId: 'swappable-tool-call',
			data: {
				result: {
					success: true,
					message: 'Corrected the grammar.',
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );

		renderHook( () => useCheckpointAction( registerMessageActions, checkpoint ) );

		const actions = getActions( registration, message );
		if ( actions[ 0 ]?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		render( createElement( actions[ 0 ].component, actions[ 0 ].componentProps ) );

		fireEvent.click( screen.getByRole( 'button', { name: 'Undo' } ) );
		await waitFor( () => expect( screen.getByRole( 'button', { name: 'Redo' } ) ).toBeEnabled() );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Reverted' );
		expect( recordBigSkyTracksEvent ).toHaveBeenNthCalledWith( 1, 'restore_checkpoint_action', {
			action: 'undo',
			id: 'swappable-tool-call',
			outcome: 'success',
		} );
		( checkpoint.canSwapCheckpoint as jest.Mock ).mockReturnValue( false );
		const driftedAction = getActions( registration, message )[ 0 ];
		expect( driftedAction ).toMatchObject( { label: 'Reverted' } );
		if ( driftedAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		expect( driftedAction.componentProps ).not.toHaveProperty( 'onRedo' );
		( checkpoint.canSwapCheckpoint as jest.Mock ).mockReturnValue( true );

		fireEvent.click( screen.getByRole( 'button', { name: 'Redo' } ) );
		await waitFor( () => expect( screen.getByRole( 'button', { name: 'Undo' } ) ).toBeEnabled() );
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Updated' );
		expect( recordBigSkyTracksEvent ).toHaveBeenNthCalledWith( 2, 'restore_checkpoint_action', {
			action: 'redo',
			id: 'swappable-tool-call',
			outcome: 'success',
		} );
		expect( checkpoint.swapCheckpoint ).toHaveBeenNthCalledWith( 1, 'swappable-tool-call' );
		expect( checkpoint.swapCheckpoint ).toHaveBeenNthCalledWith( 2, 'swappable-tool-call' );
		expect( checkpoint.restoreCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'uses restore-based Undo when the merged provider cannot swap this checkpoint', async () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		checkpoint.canSwapCheckpoint = jest.fn().mockReturnValue( undefined );
		checkpoint.swapCheckpoint = jest.fn().mockResolvedValue( undefined );
		const message = createToolMessage( {
			toolCallId: 'restore-only-tool-call',
			data: {
				result: {
					success: true,
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );

		renderHook( () => useCheckpointAction( registerMessageActions, checkpoint ) );

		const action = getActions( registration, message )[ 0 ];
		expect( action ).toMatchObject( { label: 'Updated and Undo' } );
		if ( action?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		render( createElement( action.component, action.componentProps ) );
		fireEvent.click( screen.getByRole( 'button', { name: 'Undo' } ) );

		await waitFor( () => expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Reverted' ) );
		expect( checkpoint.restoreCheckpoint ).toHaveBeenCalledWith( 'restore-only-tool-call' );
		expect( checkpoint.swapCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'invalidates a rendered Undo when the checkpoint drifts before the click', async () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		let canSwapCheckpoint = true;
		checkpoint.canSwapCheckpoint = jest.fn( () => canSwapCheckpoint );
		checkpoint.swapCheckpoint = jest.fn().mockResolvedValue( undefined );
		const onCheckpointActionInvalidated = jest.fn();
		const message = createToolMessage( {
			toolCallId: 'stale-rendered-tool-call',
			data: {
				result: {
					success: true,
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );

		renderHook( () =>
			useCheckpointAction(
				registerMessageActions,
				checkpoint,
				undefined,
				undefined,
				onCheckpointActionInvalidated
			)
		);

		const renderedAction = getActions( registration, message )[ 0 ];
		if ( renderedAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		const staleOnUndo = renderedAction.componentProps?.onUndo;
		if ( typeof staleOnUndo !== 'function' ) {
			throw new Error( 'Expected an Undo action.' );
		}

		canSwapCheckpoint = false;
		await expect( staleOnUndo() ).resolves.toBe( false );

		expect( checkpoint.swapCheckpoint ).not.toHaveBeenCalled();
		expect( onCheckpointActionInvalidated ).toHaveBeenCalledWith( 'stale-rendered-tool-call' );
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
		const refreshedAction = getActions( registration, message )[ 0 ];
		if ( refreshedAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		expect( refreshedAction.componentProps ).not.toHaveProperty( 'onUndo' );
		expect( refreshedAction.componentProps ).not.toHaveProperty( 'onRedo' );

		await expect( staleOnUndo() ).resolves.toBe( false );
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
		expect( onCheckpointActionInvalidated ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not offer Undo when a swappable text checkpoint has drifted', () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		checkpoint.canSwapCheckpoint = jest.fn().mockReturnValue( false );
		checkpoint.swapCheckpoint = jest.fn().mockResolvedValue( undefined );
		const message = createToolMessage( {
			toolCallId: 'drifted-tool-call',
			data: {
				result: {
					success: true,
					message: 'Corrected the grammar.',
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );

		renderHook( () => useCheckpointAction( registerMessageActions, checkpoint ) );

		const actions = getActions( registration, message );
		expect( actions[ 0 ] ).toMatchObject( {
			type: 'component',
			id: 'checkpoint',
			label: 'Updated',
		} );
		if ( actions[ 0 ]?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		expect( actions[ 0 ].componentProps ).not.toHaveProperty( 'onUndo' );
		expect( actions[ 0 ].componentProps ).not.toHaveProperty( 'onRedo' );
		expect( checkpoint.swapCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'disables superseded checkpoint controls and hides invalidated controls', () => {
		const registerMessageActions = jest.fn() as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		checkpoint.canSwapCheckpoint = jest.fn().mockReturnValue( true );
		checkpoint.swapCheckpoint = jest.fn().mockResolvedValue( undefined );
		const message = createToolMessage( {
			toolCallId: 'invalidated-tool-call',
			data: {
				result: {
					success: true,
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );
		( checkpoint.hasCheckpoint as jest.Mock ).mockReturnValue( false );
		let actionState: 'disabled' | 'enabled' | 'hidden' = 'disabled';
		const { result, rerender } = renderHook( () =>
			useCheckpointAction( registerMessageActions, checkpoint, () => actionState )
		);

		const supersededAction = result.current( message )[ 0 ];
		expect( supersededAction ).toMatchObject( { label: 'Updated and Undo' } );
		if ( supersededAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		expect( supersededAction.componentProps ).toMatchObject( { disabled: true } );
		expect( supersededAction.componentProps ).not.toHaveProperty( 'onUndo' );
		expect( supersededAction.componentProps ).not.toHaveProperty( 'onRedo' );
		const view = render(
			createElement( supersededAction.component, supersededAction.componentProps )
		);
		const disabledUndo = screen.getByRole( 'button', { name: 'Undo' } );
		expect( disabledUndo ).toBeDisabled();
		fireEvent.click( disabledUndo );
		expect( checkpoint.swapCheckpoint ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();

		( checkpoint.hasCheckpoint as jest.Mock ).mockReturnValue( true );
		actionState = 'enabled';
		rerender();
		invalidateCheckpointAction( 'invalidated-tool-call' );
		const invalidatedAction = result.current( message )[ 0 ];
		expect( invalidatedAction ).toMatchObject( { label: 'Updated' } );
		if ( invalidatedAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		view.rerender( createElement( invalidatedAction.component, invalidatedAction.componentProps ) );
		expect( invalidatedAction.componentProps ).not.toHaveProperty( 'onUndo' );
		expect( invalidatedAction.componentProps ).not.toHaveProperty( 'onRedo' );
		expect( screen.queryByRole( 'button', { name: 'Undo' } ) ).not.toBeInTheDocument();
		expect( checkpoint.canSwapCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'keeps a stale Undo inert when a later message disables it', async () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		checkpoint.canSwapCheckpoint = jest.fn().mockReturnValue( true );
		checkpoint.swapCheckpoint = jest.fn().mockResolvedValue( undefined );
		const onCheckpointActionInvalidated = jest.fn();
		const message = createToolMessage( {
			toolCallId: 'superseded-stale-tool-call',
			data: {
				result: {
					success: true,
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );
		let actionState: 'disabled' | 'enabled' | 'hidden' = 'enabled';

		renderHook( () =>
			useCheckpointAction(
				registerMessageActions,
				checkpoint,
				() => actionState,
				undefined,
				onCheckpointActionInvalidated
			)
		);

		const renderedAction = getActions( registration, message )[ 0 ];
		if ( renderedAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		const staleOnUndo = renderedAction.componentProps?.onUndo;
		if ( typeof staleOnUndo !== 'function' ) {
			throw new Error( 'Expected an Undo action.' );
		}

		actionState = 'disabled';
		await expect( staleOnUndo() ).resolves.toBe( false );

		expect( checkpoint.swapCheckpoint ).not.toHaveBeenCalled();
		expect( onCheckpointActionInvalidated ).not.toHaveBeenCalled();
		expect( recordBigSkyTracksEvent ).not.toHaveBeenCalled();
		const disabledAction = getActions( registration, message )[ 0 ];
		expect( disabledAction ).toMatchObject( {
			label: 'Updated and Undo',
			componentProps: { disabled: true },
		} );
		if ( disabledAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		expect( disabledAction.componentProps ).not.toHaveProperty( 'onUndo' );
	} );

	it( 'keeps a successful Reverted action as a disabled Redo after its checkpoint clears', async () => {
		const registerMessageActions = jest.fn() as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		let canSwapCheckpoint: boolean | undefined = true;
		checkpoint.canSwapCheckpoint = jest.fn( () => canSwapCheckpoint );
		checkpoint.swapCheckpoint = jest.fn().mockResolvedValue( undefined );
		const message = createToolMessage( {
			toolCallId: 'superseded-reverted-tool-call',
			data: {
				result: {
					success: true,
					outcome: 'updated',
					changeType: 'text-content',
				},
			},
		} );
		let actionState: 'disabled' | 'enabled' | 'hidden' = 'enabled';
		const { result } = renderHook( () =>
			useCheckpointAction( registerMessageActions, checkpoint, () => actionState )
		);
		const activeAction = result.current( message )[ 0 ];
		if ( activeAction?.type !== 'component' || ! activeAction.componentProps?.onUndo ) {
			throw new Error( 'Expected an Undo action.' );
		}
		await expect( activeAction.componentProps.onUndo() ).resolves.toBe( true );

		actionState = 'disabled';
		canSwapCheckpoint = undefined;
		( checkpoint.hasCheckpoint as jest.Mock ).mockReturnValue( false );

		const action = result.current( message )[ 0 ];
		expect( action ).toMatchObject( {
			label: 'Reverted and Redo',
			componentProps: { disabled: true, initiallyReverted: true },
		} );
		if ( action?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		expect( action.componentProps ).not.toHaveProperty( 'onUndo' );
		expect( action.componentProps ).not.toHaveProperty( 'onRedo' );
		render( createElement( action.component, action.componentProps ) );

		const disabledRedo = screen.getByRole( 'button', { name: 'Redo' } );
		expect( disabledRedo ).toBeDisabled();
		const trackCalls = ( recordBigSkyTracksEvent as jest.Mock ).mock.calls.length;
		fireEvent.click( disabledRedo );
		expect( checkpoint.swapCheckpoint ).toHaveBeenCalledTimes( 1 );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledTimes( trackCalls );
	} );

	it( 'uses the Jetpack tool call id for its block edit checkpoint', async () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		const message = createToolMessage( {
			toolCallId: 'jetpack-tool-call-1',
			toolId: 'wpcom__update_block_content',
			data: {
				result: {
					success: true,
					message: 'Corrected the grammar.',
					outcome: 'updated',
				},
			},
		} );

		renderHook( () => useCheckpointAction( registerMessageActions, checkpoint ) );

		const actions = getActions( registration, message );
		expect( actions[ 0 ] ).toMatchObject( {
			type: 'component',
			id: 'checkpoint',
			label: 'Updated and Undo',
		} );

		if ( actions[ 0 ]?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		render( createElement( actions[ 0 ].component, actions[ 0 ].componentProps ) );
		fireEvent.click( screen.getByRole( 'button', { name: 'Undo' } ) );

		expect( checkpoint.hasCheckpoint ).toHaveBeenCalledWith( 'jetpack-tool-call-1' );
		expect( checkpoint.restoreCheckpoint ).toHaveBeenCalledWith( 'jetpack-tool-call-1' );
		await waitFor( () => expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Reverted' ) );
	} );

	it( 'does not show Undo for a successful no-op block edit', () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		const message = createToolMessage( {
			toolCallId: 'tool-call-1',
			data: {
				result: {
					success: true,
					message: 'No edits were necessary.',
					outcome: 'no-changes',
				},
			},
		} );

		renderHook( () => useCheckpointAction( registerMessageActions, checkpoint ) );

		expect( getActions( registration, message ) ).toEqual( [] );
		expect( checkpoint.hasCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'does not show the resolved edit action for a structural block edit', () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		const message = createToolMessage( {
			toolCallId: 'structural-tool-call',
			data: {
				result: {
					success: true,
					message: 'Moved the block.',
					outcome: 'updated',
					changeType: 'other',
				},
			},
		} );

		renderHook( () => useCheckpointAction( registerMessageActions, checkpoint ) );

		expect( getActions( registration, message ) ).toEqual( [] );
		expect( checkpoint.hasCheckpoint ).not.toHaveBeenCalled();
	} );

	it( 'uses the resolved edit action for legacy block edit checkpoints', () => {
		let registration: MessageActionsRegistration | undefined;
		const registerMessageActions = jest.fn( ( nextRegistration ) => {
			registration = nextRegistration;
		} ) as UseAgentChatReturn[ 'registerMessageActions' ];
		const checkpoint = createCheckpoint();
		const message = createToolMessage( {
			data: {
				summary: 'Updated the paragraph.',
				calypsoCheckpointId: 'legacy-checkpoint-1',
			},
		} );

		renderHook( () => useCheckpointAction( registerMessageActions, checkpoint ) );

		expect( getActions( registration, message )[ 0 ] ).toMatchObject( {
			type: 'component',
			id: 'checkpoint',
			label: 'Updated and Undo',
		} );
	} );
} );
