/** @jest-environment jsdom */
import { getApprovalRequest } from '@automattic/agenttic-client';
import { act, render, renderHook, screen } from '@testing-library/react';
import { convertActionApprovalMessages } from '../../utils/convert-action-approval-messages';
import { useActionApprovals } from '../use-action-approvals';
import type { Message, TaskUpdate } from '@automattic/agenttic-client';

jest.mock(
	'@automattic/agenttic-client',
	() => jest.requireActual( '../../../../agenttic-client/src/react/actionApprovals' ),
	{ virtual: true }
);

jest.mock(
	'@automattic/agenttic-ui',
	() => jest.requireActual( '../../../../agenttic-ui/src/components/approval/ApprovalCard' ),
	{ virtual: true }
);

const message = ( proposalId = 'first' ): Message => ( {
	role: 'agent',
	kind: 'message',
	messageId: Math.random().toString(),
	parts: [
		{
			type: 'data',
			data: {
				approvalRequest: {
					version: 1,
					proposalId,
					chatId: 123,
					consumer: 'wp-agent',
					origin: 'execute',
					state: 'pending',
					ability: 'wpcom/example',
					description: 'Remove plugin from site',
					notice: 'Removes data',
					allowForChat: false,
				},
			},
		},
	],
} );
const update = ( proposalId = 'first', final = false ): TaskUpdate => ( {
	id: 'task',
	text: '',
	final,
	kind: 'status',
	status: { state: 'input-required', message: message( proposalId ) },
} );
const options = {
	enabled: true,
	scopeIdentity: 'user/site/agent',
	sessionId: 'session',
	onFetch: () => {},
};

it( 'upserts status, final and history before showing a card, retaining distinct proposals', () => {
	const { result } = renderHook( () => useActionApprovals( options ) );
	act( () => {
		result.current.recordTaskUpdate( update() );
	} );
	expect( result.current.getCards( async () => {} ) ).toHaveLength( 1 );
	expect( result.current.isBlocked() ).toBe( true );
	act( () => {
		result.current.recordTaskUpdate( update( 'first', true ) );
		result.current.onHistoryFetch( [ message() ] );
	} );
	const view = () =>
		convertActionApprovalMessages(
			[],
			result.current.getCards( async () => {} )
		).map( ( item ) => {
			const content = item.content[ 0 ];
			const Component = content.component!;
			return <Component key={ item.id } { ...content.componentProps } />;
		} );
	const { rerender: renderCards } = render( <>{ view() }</> );
	expect( screen.getAllByRole( 'region' ) ).toHaveLength( 1 );
	act( () => {
		result.current.recordTaskUpdate( update( 'second' ) );
	} );
	renderCards( <>{ view() }</> );
	expect( screen.getAllByRole( 'region' ) ).toHaveLength( 2 );
	expect( result.current.getCards( async () => {} ) ).toHaveLength( 2 );
} );

it.each( [
	{ scopeIdentity: 'other-user/site/agent' },
	{ scopeIdentity: 'user/other-site/agent' },
	{ scopeIdentity: 'user/site/other-agent' },
	{ sessionId: 'other-session' },
] )( 'drops old approvals and rejects stale updates on scope switch %o', ( change ) => {
	const { result, rerender } = renderHook( ( props ) => useActionApprovals( props ), {
		initialProps: options,
	} );
	act( () => {
		result.current.recordTaskUpdate( update() );
	} );
	const oldUpdate = result.current.recordTaskUpdate;
	const oldHistory = result.current.onHistoryFetch;
	rerender( { ...options, ...change } );
	act( () => {
		oldUpdate( update() );
		oldHistory( [ message() ] );
	} );
	expect( result.current.getCards( async () => {} ) ).toHaveLength( 0 );
	expect( result.current.hasPendingApproval ).toBe( false );
} );

it( 'keeps the original stream observer live when a new session receives its server ID', () => {
	const { result, rerender } = renderHook( ( props ) => useActionApprovals( props ), {
		initialProps: { ...options, sessionId: '' },
	} );
	const recordUpdate = result.current.recordTaskUpdate;
	rerender( { ...options, sessionId: 'assigned-session' } );
	act( () => {
		recordUpdate( update() );
	} );
	expect( result.current.getCards( async () => {} ) ).toHaveLength( 1 );
	expect( result.current.hasPendingApproval ).toBe( true );
} );

it.each( [ 'pending', 'succeeded' ] )(
	'keeps a %s card at its transcript anchor before the continuation',
	( state ) => {
		const { result } = renderHook( () => useActionApprovals( options ) );
		act( () => {
			result.current.onHistoryFetch( [ message() ] );
		} );
		act( () => {
			result.current.onHistoryFetch( [
				{
					...message(),
					parts: [
						{
							type: 'data',
							data: { approvalRequest: { ...getApprovalRequest( message().parts[ 0 ] )!, state } },
						},
					],
				},
			] );
		} );
		const transcript = [
			{
				id: 'intro',
				role: 'agent' as const,
				archived: false,
				showIcon: false,
				timestamp: 1,
				content: [ { type: 'text' as const, text: 'Intro' } ],
			},
			{
				id: 'approval:first',
				role: 'agent' as const,
				archived: false,
				showIcon: false,
				timestamp: 2,
				content: [
					{
						type: 'data' as const,
						data: {
							approvalRequest: getApprovalRequest( message().parts[ 0 ] ),
						},
					},
				],
			},
			{
				id: 'continuation',
				role: 'agent' as const,
				archived: false,
				showIcon: false,
				timestamp: 3,
				content: [ { type: 'text' as const, text: 'Result' } ],
			},
		];
		expect(
			convertActionApprovalMessages(
				transcript,
				result.current.getCards( async () => {} )
			).map( ( item ) => item.id )
		).toEqual( [ 'intro', 'approval:first', 'continuation' ] );
	}
);
