/**
 * @jest-environment jsdom
 */
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import { createElement } from '@wordpress/element';
import { recordBigSkyTracksEvent } from '../../utils/tracks';
import useCheckpointAction from '../use-checkpoint-action';
import type { UseCheckpointReturn } from '../../utils/load-external-providers';
import type { UIMessage, UseAgentChatReturn } from '@automattic/agenttic-client';

jest.mock( '../../utils/tracks', () => ( {
	recordBigSkyTracksEvent: jest.fn(),
} ) );

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

	it( 'shows the resolved edit action for a successful block edit', async () => {
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
					message: 'Corrected the grammar.',
					outcome: 'updated',
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
		expect( screen.getByRole( 'status' ) ).toHaveTextContent( 'Updated' );
		fireEvent.click( screen.getByRole( 'button', { name: 'Undo' } ) );

		expect( checkpoint.restoreCheckpoint ).toHaveBeenCalledWith( 'tool-call-1' );
		expect( recordBigSkyTracksEvent ).toHaveBeenCalledWith( 'restore_checkpoint_action', {
			id: 'tool-call-1',
		} );
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
