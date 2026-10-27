/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useActionApprovals } from '../use-action-approvals';
import type { TaskUpdate } from '@automattic/agenttic-client';

jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );

const TOOL_CALL = {
	type: 'data',
	data: {
		toolCallId: 'toolu_abc',
		toolId: 'wpcom__plugins',
		arguments: { action: 'uninstall', plugin: 'jetpack-boost' },
	},
};

function toolResult( result: unknown ) {
	return { type: 'data', data: { toolCallId: 'toolu_abc', toolId: 'wpcom__plugins', result } };
}

const HELD_RESULT = toolResult( { proposal_id: 123, status: 'awaiting_user_approval' } );

function taskUpdate( parts: unknown[], role = 'agent', state = 'working' ) {
	return {
		id: 'task-1',
		kind: 'status',
		status: { state, message: { role, parts } },
	} as unknown as TaskUpdate;
}

// A held client tool streams no call part: its result carries the call.
const CLIENT_TOOL_ARGUMENTS = { path: '/wp-admin/site-editor.php', canvas: 'edit' };
const CLIENT_HELD_RESULT = {
	type: 'data',
	data: {
		toolCallId: 'toolu_client',
		toolId: 'site_editor_navigate',
		result: {
			proposal_id: 125,
			status: 'awaiting_user_approval',
			message: 'Not performed. The user was asked to approve this action and has not answered yet.',
			tool_id: 'site_editor_navigate',
			arguments: CLIENT_TOOL_ARGUMENTS,
		},
	},
};
// Allow hands the stored call back to run, under the held call's id.
const CLIENT_TOOL_CALL = {
	type: 'data',
	data: {
		toolCallId: 'toolu_client',
		toolId: 'site-editor/navigate',
		arguments: CLIENT_TOOL_ARGUMENTS,
	},
};
const CLIENT_TOOL_RESULT = {
	type: 'data',
	data: { toolCallId: 'toolu_client', toolId: 'site-editor/navigate', result: { success: true } },
};

function renderApprovals() {
	return renderHook( ( { streamGeneration } ) => useActionApprovals( streamGeneration ), {
		initialProps: { streamGeneration: Symbol() },
	} );
}

describe( 'useActionApprovals', () => {
	it( 'adds a pending card with its call’s arguments when a call is held', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL ] ) );
			result.current.recordApprovalUpdate( taskUpdate( [ HELD_RESULT ] ) );
		} );

		expect( result.current.approvals.get( 'toolu_abc' ) ).toEqual(
			expect.objectContaining( {
				toolId: 'wpcom__plugins',
				proposalId: 123,
				arguments: { action: 'uninstall', plugin: 'jetpack-boost' },
				status: 'pending',
			} )
		);
	} );

	it( 'ignores results of calls that weren’t held', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL, toolResult( 'ok' ) ] ) );
		} );

		expect( result.current.approvals.size ).toBe( 0 );
	} );

	it.each( [
		[ { status: 'failed', message: 'Nope' }, 'failed' ],
		[ { status: 'declined' }, 'declined' ],
		[ { status: 'cancelled' }, 'cancelled' ],
		[ { success: true }, 'done' ],
	] )( 'updates the card from the call’s later result %p', ( outcome, status ) => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL, HELD_RESULT ] ) );
		} );
		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL, toolResult( outcome ) ] ) );
		} );

		expect( result.current.approvals.get( 'toolu_abc' )?.status ).toBe( status );
	} );

	it( 'keeps a card’s place when its held result streams again', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL, HELD_RESULT ] ) );
		} );
		const { timestamp } = result.current.approvals.get( 'toolu_abc' )!;
		act( () => {
			result.current.updateApproval( 'toolu_abc', { status: 'sending' } );
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL, HELD_RESULT ] ) );
		} );

		expect( result.current.approvals.get( 'toolu_abc' ) ).toEqual(
			expect.objectContaining( { status: 'sending', timestamp } )
		);
	} );

	it( 'keeps only the latest held call waiting, and shows earlier ones as not performed', () => {
		const { result } = renderApprovals();
		const laterHeldResult = {
			type: 'data',
			data: {
				toolCallId: 'toolu_later',
				toolId: 'wpcom__plugins',
				result: { proposal_id: 124, status: 'awaiting_user_approval' },
			},
		};

		act( () => {
			result.current.recordApprovalUpdate(
				taskUpdate( [ TOOL_CALL, HELD_RESULT, laterHeldResult ] )
			);
		} );

		expect( result.current.approvals.get( 'toolu_abc' )?.status ).toBe( 'cancelled' );
		expect( result.current.approvals.get( 'toolu_later' )?.status ).toBe( 'pending' );
	} );

	it( 'adds a pending card with a held client tool’s own tool id and arguments', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate(
				taskUpdate( [ CLIENT_HELD_RESULT ], 'agent', 'running' )
			);
		} );

		expect( result.current.approvals.get( 'toolu_client' ) ).toEqual(
			expect.objectContaining( {
				toolId: 'site_editor_navigate',
				proposalId: 125,
				arguments: CLIENT_TOOL_ARGUMENTS,
				status: 'pending',
			} )
		);
	} );

	it( 'prefers a held call’s call part to its result for a server ability', () => {
		const { result } = renderApprovals();
		const heldResultWithCall = toolResult( {
			proposal_id: 123,
			status: 'awaiting_user_approval',
			tool_id: 'other_tool',
			arguments: { other: 'value' },
		} );

		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL ], 'agent', 'running' ) );
			result.current.recordApprovalUpdate(
				taskUpdate( [ heldResultWithCall ], 'agent', 'running' )
			);
		} );

		expect( result.current.approvals.get( 'toolu_abc' ) ).toEqual(
			expect.objectContaining( { arguments: { action: 'uninstall', plugin: 'jetpack-boost' } } )
		);
	} );

	it( 'shows an allowed client tool in progress while the client runs it, then done', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate(
				taskUpdate( [ CLIENT_HELD_RESULT ], 'agent', 'running' )
			);
		} );
		act( () => {
			result.current.updateApproval( 'toolu_client', { status: 'sending' } );
			result.current.recordApprovalUpdate(
				taskUpdate( [ CLIENT_TOOL_CALL ], 'agent', 'input-required' )
			);
		} );

		expect( result.current.approvals.get( 'toolu_client' ) ).toEqual(
			expect.objectContaining( { toolId: 'site_editor_navigate', status: 'in-progress' } )
		);
		expect( result.current.approvals.size ).toBe( 1 );

		act( () => {
			result.current.recordApprovalUpdate(
				taskUpdate( [ CLIENT_TOOL_CALL, CLIENT_TOOL_RESULT ], 'user', 'working' )
			);
		} );

		expect( result.current.approvals.get( 'toolu_client' )?.status ).toBe( 'done' );
	} );

	it( 'leaves other cards alone when an input-required call isn’t an answered card', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL, HELD_RESULT ] ) );
		} );
		act( () => {
			result.current.recordApprovalUpdate(
				taskUpdate( [ CLIENT_TOOL_CALL ], 'agent', 'input-required' )
			);
			result.current.recordApprovalUpdate(
				taskUpdate( [ CLIENT_TOOL_CALL, CLIENT_TOOL_RESULT ], 'user', 'working' )
			);
		} );

		expect( result.current.approvals.size ).toBe( 1 );
		expect( result.current.approvals.get( 'toolu_abc' )?.status ).toBe( 'pending' );
	} );

	it( 'drops the cards when the stream generation changes', () => {
		const { result, rerender } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL, HELD_RESULT ] ) );
		} );
		rerender( { streamGeneration: Symbol() } );

		expect( result.current.approvals.size ).toBe( 0 );
	} );
} );
