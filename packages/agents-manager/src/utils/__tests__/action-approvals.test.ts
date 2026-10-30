import {
	getApprovalErrorUpdate,
	getApprovalActionLabel,
	getApprovalOutcome,
	getApprovalStatusMessage,
	getHeldProposalId,
	getHeldToolCall,
	getSentToolResultIds,
	getToolPartsFromTaskUpdate,
	insertApprovalCardMessages,
	type ActionApproval,
} from '../action-approvals';
import type { TaskUpdate } from '@automattic/agenttic-client';

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text: string ) => text,
	sprintf: ( format: string, ...values: string[] ) => {
		let index = 0;
		return format.replace( /%(\d)\$s|%s/g, ( _match, position?: string ) =>
			position ? values[ Number( position ) - 1 ] : values[ index++ ]
		);
	},
} ) );

const HELD_RESULT = {
	proposal_id: 123,
	status: 'awaiting_user_approval',
	message: 'Not performed. The user was asked to approve this action and has not answered yet.',
};

function taskUpdate(
	parts: unknown[],
	{ role = 'agent', kind = 'status', state = 'working' } = {}
) {
	return {
		id: 'task-1',
		kind,
		status: { state, message: { role, parts } },
	} as unknown as TaskUpdate;
}

function approval( overrides: Partial< ActionApproval > = {} ): ActionApproval {
	return {
		toolCallId: 'toolu_abc',
		toolId: 'wpcom__plugins',
		proposalId: 123,
		arguments: {},
		status: 'pending',
		timestamp: 0,
		...overrides,
	};
}

describe( 'getToolPartsFromTaskUpdate', () => {
	it( 'reads the tool calls and results of an agent message', () => {
		const update = taskUpdate( [
			{ type: 'text', text: 'Let me check.' },
			{
				type: 'data',
				data: {
					toolCallId: 'toolu_abc',
					toolId: 'wpcom__plugins',
					arguments: { action: 'uninstall' },
				},
			},
			{
				type: 'data',
				data: { toolCallId: 'toolu_abc', toolId: 'wpcom__plugins', result: HELD_RESULT },
			},
		] );

		expect( getToolPartsFromTaskUpdate( update ) ).toEqual( {
			calls: [
				{ toolCallId: 'toolu_abc', toolId: 'wpcom__plugins', arguments: { action: 'uninstall' } },
			],
			results: [ { toolCallId: 'toolu_abc', toolId: 'wpcom__plugins', result: HELD_RESULT } ],
		} );
	} );

	it( 'skips the client’s own history echo', () => {
		const update = taskUpdate(
			[ { type: 'data', data: { toolCallId: 'a', toolId: 'b', result: HELD_RESULT } } ],
			{ role: 'user' }
		);

		expect( getToolPartsFromTaskUpdate( update ) ).toEqual( { calls: [], results: [] } );
	} );

	it( 'skips token deltas', () => {
		const update = taskUpdate(
			[ { type: 'data', data: { toolCallId: 'a', toolId: 'b', arguments: { partial: true } } } ],
			{ kind: 'delta' }
		);

		expect( getToolPartsFromTaskUpdate( update ) ).toEqual( { calls: [], results: [] } );
	} );
} );

describe( 'getHeldProposalId', () => {
	it.each( [
		[ 'a numeric id', HELD_RESULT, 123 ],
		[ 'a digit string id', { ...HELD_RESULT, proposal_id: '45' }, 45 ],
		[ 'a non-numeric id', { ...HELD_RESULT, proposal_id: 'abc' }, undefined ],
		[ 'another status', { ...HELD_RESULT, status: 'failed' }, undefined ],
		[ 'a plain result', 'ok', undefined ],
	] )( 'reads %s', ( _label, result, expected ) => {
		expect( getHeldProposalId( result ) ).toBe( expected );
	} );
} );

describe( 'getHeldToolCall', () => {
	it( 'reads the tool id and arguments a held client tool carries', () => {
		expect(
			getHeldToolCall( {
				...HELD_RESULT,
				tool_id: 'site_editor_navigate',
				arguments: { path: '/wp-admin/site-editor.php' },
			} )
		).toEqual( {
			toolId: 'site_editor_navigate',
			arguments: { path: '/wp-admin/site-editor.php' },
		} );
	} );

	it.each( [
		[ 'a held server ability', HELD_RESULT ],
		[ 'a plain result', 'ok' ],
		[ 'arguments that aren’t an object', { ...HELD_RESULT, tool_id: '', arguments: 'x' } ],
	] )( 'reads nothing from %s', ( _label, result ) => {
		expect( getHeldToolCall( result ) ).toEqual( {} );
	} );
} );

describe( 'getSentToolResultIds', () => {
	const sentResult = {
		type: 'data',
		data: { toolCallId: 'toolu_abc', toolId: 'site_editor_navigate', result: { success: true } },
	};
	const historyCall = {
		type: 'data',
		data: { toolCallId: 'toolu_abc', toolId: 'site_editor_navigate', arguments: {} },
	};

	it( 'reads the results the client sends back after running a call', () => {
		expect(
			getSentToolResultIds( taskUpdate( [ historyCall, sentResult ], { role: 'user' } ) )
		).toEqual( [ 'toolu_abc' ] );
	} );

	it.each( [
		[ 'an agent message', { role: 'agent' } ],
		[ 'a delta', { role: 'user', kind: 'delta' } ],
		[ 'a running update', { role: 'user', state: 'running' } ],
	] )( 'reads nothing from %s', ( _label, options ) => {
		expect( getSentToolResultIds( taskUpdate( [ sentResult ], options ) ) ).toEqual( [] );
	} );
} );

describe( 'getApprovalOutcome', () => {
	it.each( [
		[
			{ status: 'failed', message: 'Nope' },
			{ status: 'failed', message: 'Nope' },
		],
		[ { status: 'declined' }, { status: 'declined' } ],
		[ { status: 'cancelled' }, { status: 'cancelled' } ],
		[ { success: true, plugins: [] }, { status: 'done' } ],
		[ 'Uninstalled', { status: 'done' } ],
	] )( 'maps %p to %p', ( result, expected ) => {
		expect( getApprovalOutcome( result ) ).toEqual( expected );
	} );

	it( 'has no outcome while the call is still held', () => {
		expect( getApprovalOutcome( HELD_RESULT ) ).toBeUndefined();
	} );
} );

describe( 'getApprovalErrorUpdate', () => {
	function rpcError( data: unknown ) {
		return Object.assign( new Error( 'Streaming error: approval' ), { data } );
	}

	it.each( [
		[ 'approved', 'in-progress' ],
		[ 'executing', 'in-progress' ],
		[ 'succeeded', 'done' ],
		[ 'failed', 'failed' ],
		[ 'declined', 'declined' ],
		[ 'cancelled', 'cancelled' ],
		[ 'outcome_unknown', 'unknown' ],
	] )( 'sets an already decided card from its stored %s state', ( state, status ) => {
		expect(
			getApprovalErrorUpdate( rpcError( { code: 'approval_already_decided', state } ) )
		).toEqual( { status } );
	} );

	it( 'shows the result as unknown when the stored state isn’t one it knows', () => {
		expect(
			getApprovalErrorUpdate( rpcError( { code: 'approval_already_decided', state: 'expired' } ) )
		).toEqual( { status: 'unknown' } );
	} );

	it( 'stops offering an answer for a card the server no longer has', () => {
		expect( getApprovalErrorUpdate( rpcError( { code: 'approval_not_found' } ) ) ).toEqual( {
			status: 'unavailable',
		} );
	} );

	it( 'stops offering an answer for a card proposed for another site', () => {
		expect( getApprovalErrorUpdate( rpcError( { code: 'approval_site_mismatch' } ) ) ).toEqual( {
			status: 'unavailable',
			message: 'This request was made on another site and can’t be answered here.',
		} );
	} );

	it.each( [
		[ 'a transient storage error', rpcError( { code: 'approval_storage_failed' } ) ],
		[ 'a lost claim', rpcError( { code: 'approval_claim_lost' } ) ],
		[ 'a network error', new Error( 'Failed to fetch' ) ],
	] )( 'lets the user retry after %s', ( _label, error ) => {
		expect( getApprovalErrorUpdate( error ) ).toEqual( {
			status: 'error',
			message: 'Your answer couldn’t be sent. Please try again.',
		} );
	} );
} );

describe( 'getApprovalActionLabel', () => {
	it.each( [
		[
			'wpcom__plugins',
			{ action: 'uninstall', plugin: 'hello-dolly' },
			'Plugin uninstall (hello-dolly)',
		],
		[ 'wpcom__update_site_settings', { blogname: 'My site' }, 'Update site settings (My site)' ],
		[ 'wpcom__site_status', { action: 'refresh' }, 'Site status refresh' ],
		[ 'wpcom__plugins', { action: 'list', options: { all: true } }, 'Plugin list' ],
		[ 'wpcom__plugin_uninstall', { plugin: 'hello-dolly' }, 'Plugin uninstall (hello-dolly)' ],
		[ 'plugins', {}, 'Plugins' ],
	] )( 'labels %s with %p as %s', ( toolId, args, label ) => {
		expect( getApprovalActionLabel( { toolId, arguments: args } ) ).toBe( label );
	} );
} );

describe( 'getApprovalStatusMessage', () => {
	const UNINSTALL = { arguments: { action: 'uninstall', plugin: 'hello-dolly' } };

	it.each( [
		[ { status: 'done' }, 'Approved: Plugin uninstall (hello-dolly). Done.' ],
		[
			{ status: 'failed', message: 'Plugin is active.' },
			'Approved: Plugin uninstall (hello-dolly). Failed: Plugin is active.',
		],
		[ { status: 'failed' }, 'Approved: Plugin uninstall (hello-dolly). Failed.' ],
		[ { status: 'declined' }, 'Declined: Plugin uninstall (hello-dolly).' ],
		[ { status: 'cancelled' }, 'Not performed: Plugin uninstall (hello-dolly).' ],
		[ { status: 'in-progress' }, 'Approved: Plugin uninstall (hello-dolly). In progress.' ],
		[ { status: 'unknown' }, 'Approved: Plugin uninstall (hello-dolly). Result unknown.' ],
		[ { status: 'unavailable' }, 'This request is no longer available.' ],
		[ { status: 'unavailable', message: 'Made elsewhere.' }, 'Made elsewhere.' ],
	] as const )( 'describes %p', ( overrides, expected ) => {
		expect( getApprovalStatusMessage( approval( { ...UNINSTALL, ...overrides } ) ) ).toBe(
			expected
		);
	} );

	it.each( [ 'pending', 'sending', 'error' ] as const )(
		'has no message while the card is %s',
		( status ) => {
			expect( getApprovalStatusMessage( approval( { status } ) ) ).toBeUndefined();
		}
	);
} );

describe( 'insertApprovalCardMessages', () => {
	it( 'places each card before the first message that came after it', () => {
		const messages = [
			{ id: 'user', timestamp: 10 },
			{ id: 'reply', timestamp: 30 },
		];
		const cards = [
			{ id: 'late-card', timestamp: 40 },
			{ id: 'card', timestamp: 20 },
		];

		expect(
			insertApprovalCardMessages( messages, cards ).map( ( message ) => message.id )
		).toEqual( [ 'user', 'card', 'reply', 'late-card' ] );
	} );

	it( 'returns the same messages when there are no cards', () => {
		const messages = [ { id: 'user', timestamp: 10 } ];

		expect( insertApprovalCardMessages( messages, [] ) ).toBe( messages );
	} );
} );
