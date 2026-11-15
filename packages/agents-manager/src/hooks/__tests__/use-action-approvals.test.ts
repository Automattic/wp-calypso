/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useActionApprovals } from '../use-action-approvals';
import type { TaskUpdate } from '@automattic/agenttic-client';

jest.mock( '@wordpress/i18n', () => ( { __: ( text: string ) => text } ) );

const APPROVAL_REQUEST = {
	proposalId: 123,
	toolCallId: 'toolu_abc',
	toolId: 'wpcom__plugin_uninstall',
	ability: 'wpcom/plugin-uninstall',
	label: 'Uninstall plugin',
	arguments: { slug: 'jetpack-boost' },
	origin: 'execute',
	siteId: 12345,
};

function heldUpdate( request: Record< string, unknown > = APPROVAL_REQUEST ) {
	return {
		id: 'task-1',
		kind: 'status',
		final: true,
		status: {
			state: 'auth-required',
			final: true,
			message: {
				role: 'agent',
				messageId: `approval-${ request.toolCallId }`,
				parts: [
					{ type: 'text', text: 'This action needs your approval: Uninstall plugin.' },
					{ type: 'data', data: { approvalRequest: request } },
				],
			},
		},
	} as unknown as TaskUpdate;
}

function toolResult( result: unknown, toolCallId = 'toolu_abc' ) {
	return { type: 'data', data: { toolCallId, toolId: 'wpcom__plugin_uninstall', result } };
}

function taskUpdate( parts: unknown[], role = 'agent', state = 'working' ) {
	return {
		id: 'task-1',
		kind: 'status',
		status: { state, message: { role, parts } },
	} as unknown as TaskUpdate;
}

// A held client tool: Allow hands the call back to run, under the held call's id.
const CLIENT_TOOL_ARGUMENTS = { path: '/wp-admin/site-editor.php', canvas: 'edit' };
const CLIENT_APPROVAL_REQUEST = {
	...APPROVAL_REQUEST,
	proposalId: 125,
	toolCallId: 'toolu_client',
	toolId: 'site-editor/navigate',
	ability: 'site-editor/navigate',
	label: 'Open the site editor',
	arguments: CLIENT_TOOL_ARGUMENTS,
	origin: 'dispatch',
};
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
	it.each( [ 'execute', 'dispatch' ] )(
		'adds a pending card from a held %s call’s approval request',
		( origin ) => {
			const { result } = renderApprovals();

			act( () => {
				result.current.recordApprovalUpdate( heldUpdate( { ...APPROVAL_REQUEST, origin } ) );
			} );

			expect( result.current.approvals.get( 'toolu_abc' ) ).toEqual(
				expect.objectContaining( {
					toolId: 'wpcom__plugin_uninstall',
					proposalId: 123,
					label: 'Uninstall plugin',
					arguments: { slug: 'jetpack-boost' },
					origin,
					messageId: 'approval-toolu_abc',
					status: 'pending',
				} )
			);
			expect( result.current.isAwaitingApprovalAnswer ).toBe( true );
		}
	);

	it( 'ignores results of calls that weren’t held', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( taskUpdate( [ toolResult( 'ok' ) ] ) );
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
			result.current.recordApprovalUpdate( heldUpdate() );
		} );
		act( () => {
			result.current.updateApproval( 'toolu_abc', { status: 'sending' } );
			result.current.recordApprovalUpdate( taskUpdate( [ toolResult( outcome ) ] ) );
		} );

		expect( result.current.approvals.get( 'toolu_abc' )?.status ).toBe( status );
		expect( result.current.isAwaitingApprovalAnswer ).toBe( false );
	} );

	it( 'keeps a card’s place when its request streams again', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( heldUpdate() );
		} );
		const { timestamp } = result.current.approvals.get( 'toolu_abc' )!;
		act( () => {
			result.current.updateApproval( 'toolu_abc', { status: 'sending' } );
			result.current.recordApprovalUpdate( heldUpdate() );
		} );

		expect( result.current.approvals.get( 'toolu_abc' ) ).toEqual(
			expect.objectContaining( { status: 'sending', timestamp } )
		);
	} );

	it( 'keeps only the latest held call waiting, and shows earlier ones as not performed', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( heldUpdate() );
		} );
		act( () => {
			result.current.recordApprovalUpdate(
				heldUpdate( { ...APPROVAL_REQUEST, proposalId: 124, toolCallId: 'toolu_later' } )
			);
		} );

		expect( result.current.approvals.get( 'toolu_abc' )?.status ).toBe( 'cancelled' );
		expect( result.current.approvals.get( 'toolu_later' )?.status ).toBe( 'pending' );
	} );

	it( 'cancels a waiting card, and leaves answered ones alone', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( heldUpdate() );
			result.current.updateApproval( 'toolu_abc', { status: 'done' } );
			result.current.recordApprovalUpdate( heldUpdate( CLIENT_APPROVAL_REQUEST ) );
		} );
		act( () => {
			result.current.cancelAwaitingApprovals();
		} );

		expect( result.current.approvals.get( 'toolu_abc' )?.status ).toBe( 'done' );
		expect( result.current.approvals.get( 'toolu_client' )?.status ).toBe( 'cancelled' );
		expect( result.current.isAwaitingApprovalAnswer ).toBe( false );
	} );

	it( 'shows an allowed client tool in progress while the client runs it, then done', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( heldUpdate( CLIENT_APPROVAL_REQUEST ) );
			result.current.updateApproval( 'toolu_client', { status: 'sending' } );
		} );
		act( () => {
			result.current.recordApprovalUpdate(
				taskUpdate( [ CLIENT_TOOL_CALL ], 'agent', 'input-required' )
			);
		} );
		expect( result.current.approvals.get( 'toolu_client' )?.status ).toBe( 'in-progress' );

		act( () => {
			result.current.recordApprovalUpdate(
				taskUpdate( [ CLIENT_TOOL_CALL, CLIENT_TOOL_RESULT ], 'user', 'working' )
			);
		} );
		expect( result.current.approvals.get( 'toolu_client' )?.status ).toBe( 'done' );
	} );

	it( 'leaves a card waiting when an input-required call wasn’t answered from it', () => {
		const { result } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( heldUpdate( CLIENT_APPROVAL_REQUEST ) );
		} );
		act( () => {
			result.current.recordApprovalUpdate(
				taskUpdate( [ CLIENT_TOOL_CALL ], 'agent', 'input-required' )
			);
		} );

		expect( result.current.approvals.get( 'toolu_client' )?.status ).toBe( 'pending' );
	} );

	it( 'starts a new stream generation with no cards', () => {
		const { result, rerender } = renderApprovals();

		act( () => {
			result.current.recordApprovalUpdate( heldUpdate() );
		} );
		rerender( { streamGeneration: Symbol() } );

		expect( result.current.approvals.size ).toBe( 0 );
	} );
} );
