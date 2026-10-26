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

function taskUpdate( parts: unknown[], role = 'agent' ) {
	return {
		id: 'task-1',
		kind: 'status',
		status: { state: 'working', message: { role, parts } },
	} as unknown as TaskUpdate;
}

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

	it( 'drops the cards when the stream generation changes', () => {
		const { result, rerender } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ TOOL_CALL, HELD_RESULT ] ) );
		} );
		rerender( { streamGeneration: Symbol() } );

		expect( result.current.approvals.size ).toBe( 0 );
	} );
} );
