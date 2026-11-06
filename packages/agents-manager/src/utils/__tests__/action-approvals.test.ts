import {
	getApprovalErrorUpdate,
	getApprovalActionLabel,
	getApprovalDecisionData,
	getApprovalOutcome,
	getApprovalRequestFromTaskUpdate,
	getApprovalStatusMessage,
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

const APPROVAL_REQUEST = {
	proposalId: 4321,
	toolCallId: 'call_abc',
	toolId: 'wpcom__plugin_uninstall',
	ability: 'wpcom/plugin-uninstall',
	label: 'Uninstall plugin',
	arguments: { slug: 'hello-dolly' },
	origin: 'execute',
	siteId: 12345,
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
		origin: 'execute',
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
				data: { toolCallId: 'toolu_abc', toolId: 'wpcom__plugins', result: { success: true } },
			},
		] );

		expect( getToolPartsFromTaskUpdate( update ) ).toEqual( {
			calls: [
				{ toolCallId: 'toolu_abc', toolId: 'wpcom__plugins', arguments: { action: 'uninstall' } },
			],
			results: [ { toolCallId: 'toolu_abc', toolId: 'wpcom__plugins', result: { success: true } } ],
		} );
	} );

	it( 'skips the client’s own history echo', () => {
		const update = taskUpdate(
			[ { type: 'data', data: { toolCallId: 'a', toolId: 'b', result: { success: true } } } ],
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

describe( 'getApprovalRequestFromTaskUpdate', () => {
	function heldUpdate( request: unknown, { state = 'auth-required', role = 'agent' } = {} ) {
		return {
			id: 'task-1',
			kind: 'status',
			final: true,
			status: {
				state,
				message: {
					role,
					messageId: 'approval-message',
					parts: [
						{ type: 'text', text: 'This action needs your approval: Uninstall plugin.' },
						{ type: 'data', data: { approvalRequest: request } },
					],
				},
			},
		} as unknown as TaskUpdate;
	}

	it( 'reads the approval request of a held call', () => {
		expect( getApprovalRequestFromTaskUpdate( heldUpdate( APPROVAL_REQUEST ) ) ).toEqual( {
			toolCallId: 'call_abc',
			toolId: 'wpcom__plugin_uninstall',
			proposalId: 4321,
			label: 'Uninstall plugin',
			arguments: { slug: 'hello-dolly' },
			origin: 'execute',
			messageId: 'approval-message',
		} );
	} );

	it( 'reads a held client tool', () => {
		expect(
			getApprovalRequestFromTaskUpdate(
				heldUpdate( { ...APPROVAL_REQUEST, origin: 'dispatch', label: '', arguments: {} } )
			)
		).toEqual( {
			toolCallId: 'call_abc',
			toolId: 'wpcom__plugin_uninstall',
			proposalId: 4321,
			arguments: {},
			origin: 'dispatch',
			messageId: 'approval-message',
		} );
	} );

	it( 'reads a digit string proposal id', () => {
		expect(
			getApprovalRequestFromTaskUpdate( heldUpdate( { ...APPROVAL_REQUEST, proposalId: '45' } ) )
				?.proposalId
		).toBe( 45 );
	} );

	it.each( [
		[ 'another state', heldUpdate( APPROVAL_REQUEST, { state: 'completed' } ) ],
		[ 'a user message', heldUpdate( APPROVAL_REQUEST, { role: 'user' } ) ],
		[ 'a request with no proposal id', heldUpdate( { ...APPROVAL_REQUEST, proposalId: 'abc' } ) ],
		[ 'a request with no call id', heldUpdate( { ...APPROVAL_REQUEST, toolCallId: '' } ) ],
		[ 'a request that isn’t an object', heldUpdate( 'call_abc' ) ],
	] )( 'reads nothing from %s', ( _label, update ) => {
		expect( getApprovalRequestFromTaskUpdate( update ) ).toBeUndefined();
	} );
} );

describe( 'getApprovalDecisionData', () => {
	it( 'puts the decision under a top-level approvalDecision', () => {
		expect( getApprovalDecisionData( 4321, 'decline' ) ).toEqual( {
			approvalDecision: { proposalId: 4321, decision: 'decline' },
		} );
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
} );

describe( 'getApprovalErrorUpdate', () => {
	function rpcError( data: unknown ) {
		return Object.assign( new Error( 'Streaming error: approval' ), { data } );
	}

	it.each( [
		[ 'approved', 'in-progress' ],
		[ 'executing', 'in-progress' ],
		[ 'dispatched', 'in-progress' ],
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

	it( 'stops offering an answer when the stored state isn’t one it knows', () => {
		expect(
			getApprovalErrorUpdate( rpcError( { code: 'approval_already_decided', state: 'expired' } ) )
		).toEqual( { status: 'unavailable' } );
	} );

	it.each( [
		'approval_not_found',
		'approval_extension_required',
		'invalid_approval_decision',
		'approval_claim_lost',
		'approval_storage_failed',
	] )( 'stops offering an answer after %s', ( code ) => {
		expect( getApprovalErrorUpdate( rpcError( { code } ) ) ).toEqual( {
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
		[ 'a network error', new Error( 'Failed to fetch' ) ],
		[ 'a server error before the stream', new Error( 'HTTP error! status: 503' ) ],
		[ 'an error with another code', rpcError( { code: 'rest_forbidden' } ) ],
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

	it( 'uses the server’s label when there is one', () => {
		expect(
			getApprovalActionLabel( {
				toolId: 'wpcom__plugin_uninstall',
				arguments: { slug: 'hello-dolly' },
				label: 'Uninstall plugin',
			} )
		).toBe( 'Uninstall plugin' );
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
