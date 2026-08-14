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
import useCheckpointAction, { invalidateCheckpointAction } from '../use-checkpoint-action';
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

	it( 'hides unavailable and invalidated checkpoint controls', () => {
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
		let isAvailable = false;
		const { result, rerender } = renderHook( () =>
			useCheckpointAction( registerMessageActions, checkpoint, () => isAvailable )
		);

		const unavailableAction = result.current( message )[ 0 ];
		expect( unavailableAction ).toMatchObject( { label: 'Updated' } );
		if ( unavailableAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		expect( unavailableAction.componentProps ).not.toHaveProperty( 'onUndo' );
		expect( unavailableAction.componentProps ).not.toHaveProperty( 'onRedo' );

		isAvailable = true;
		rerender();
		invalidateCheckpointAction( 'invalidated-tool-call' );
		const invalidatedAction = result.current( message )[ 0 ];
		expect( invalidatedAction ).toMatchObject( { label: 'Updated' } );
		if ( invalidatedAction?.type !== 'component' ) {
			throw new Error( 'Expected a component action.' );
		}
		expect( invalidatedAction.componentProps ).not.toHaveProperty( 'onUndo' );
		expect( invalidatedAction.componentProps ).not.toHaveProperty( 'onRedo' );
		expect( checkpoint.canSwapCheckpoint ).not.toHaveBeenCalled();
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
