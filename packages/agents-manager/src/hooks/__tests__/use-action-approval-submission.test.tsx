/** @jest-environment jsdom */
import { act, renderHook, waitFor } from '@testing-library/react';
import { restoreConversationApprovals } from '../../utils/action-approval-api';
import { useActionApprovals } from '../use-action-approvals';
import type { ApprovalRequest, ServerLoadResult, SubmitOptions } from '@automattic/agenttic-client';
import type { ApprovalDecision } from '@automattic/agenttic-ui';

jest.mock(
	'@automattic/agenttic-client',
	() => jest.requireActual( '../../../../agenttic-client/src/react/actionApprovals' ),
	{ virtual: true }
);

const request: ApprovalRequest = {
	version: 1,
	proposalId: 'proposal/123',
	chatId: 456,
	consumer: 'wp-agent',
	origin: 'execute',
	state: 'pending',
	ability: 'wpcom/example',
	description: 'Remove plugin from site',
	notice: 'Removes data',
	allowForChat: true,
};
const message = {
	role: 'agent' as const,
	kind: 'message' as const,
	messageId: 'approval:proposal/123',
	parts: [ { type: 'data' as const, data: { approvalRequest: request } } ],
};
const options = {
	enabled: true,
	scopeIdentity: 'user/site/agent',
	sessionId: 'session',
	onFetch: () => {},
	authProvider: async () => ( { Authorization: 'raw-jwt' } ),
};
const response = ( value: unknown ) => ( { ok: true, json: async () => value } ) as Response;
const originalFetch = globalThis.fetch;
let fetchMock: jest.Mock;

beforeEach( () => {
	fetchMock = jest.fn();
	globalThis.fetch = fetchMock;
} );
afterEach( () => {
	globalThis.fetch = originalFetch;
	jest.restoreAllMocks();
} );

it.each< [ string, ApprovalDecision ] >( [
	[ 'Bearer token', 'allow_once' ],
	[ 'raw-jwt', 'allow_for_chat' ],
	[ 'raw-jwt', 'decline' ],
] )(
	'preserves %s authentication and resumes the %s decision',
	async ( authorization, decision ) => {
		const finalState = decision === 'decline' ? 'declined' : 'succeeded';
		fetchMock
			.mockResolvedValueOnce(
				response( {
					proposalId: request.proposalId,
					state: decision === 'decline' ? 'declined' : 'approved',
				} )
			)
			.mockResolvedValueOnce( response( { proposals: [ { ...request, state: finalState } ] } ) );
		const resumes: SubmitOptions[] = [];
		const send = async ( text: string, submitOptions?: SubmitOptions ) => {
			expect( text ).toBe( '' );
			resumes.push( submitOptions! );
		};
		const { result } = renderHook( () =>
			useActionApprovals( {
				...options,
				authProvider: async () => ( { Authorization: authorization } ),
			} )
		);
		act( () => {
			result.current.onHistoryFetch( [ message ], 456 );
		} );
		act( () => {
			result.current.getCards( send )[ 0 ].props.onDecision( decision );
		} );
		expect( result.current.getCards( send )[ 0 ].props.state ).toBe( 'sending' );
		await waitFor( () => expect( result.current.hasPendingApproval ).toBe( false ) );
		expect( result.current.getCards( send )[ 0 ].props.state ).toBe(
			decision === 'decline' ? 'declined' : 'done'
		);
		const [ url, init ] = fetchMock.mock.calls[ 0 ];
		expect( new URL( url ).pathname ).toBe( '/wpcom/v2/ai/approvals/proposal%2F123' );
		expect( init.method ).toBe( 'POST' );
		expect( JSON.parse( init.body ) ).toEqual( { decision, chatId: 456 } );
		expect( init.headers.Authorization ).toBe( authorization );
		expect( resumes ).toHaveLength( 1 );
		expect( resumes[ 0 ] ).toMatchObject( {
			type: 'approval_resume',
			approvalResume: { proposalId: 'proposal/123', chatId: 456 },
		} );
	}
);

it( 'retries only continuation after a saved decision and failed resume', async () => {
	jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	fetchMock
		.mockResolvedValueOnce( response( { proposalId: request.proposalId, state: 'approved' } ) )
		.mockResolvedValueOnce( response( { proposals: [ { ...request, state: 'succeeded' } ] } ) );
	let attempts = 0;
	const send = async () => {
		if ( ++attempts === 1 ) {
			throw new Error( 'Connection lost' );
		}
	};
	const { result } = renderHook( () => useActionApprovals( options ) );
	act( () => {
		result.current.onHistoryFetch( [ message ], 456 );
		result.current.getCards( send )[ 0 ].props.onDecision( 'allow_once' );
	} );
	await waitFor( () =>
		expect( result.current.getCards( send )[ 0 ].props.onRetryResume ).toBeDefined()
	);
	expect( result.current.hasPendingApproval ).toBe( false );
	expect( result.current.getCards( send )[ 0 ].props.state ).not.toBe( 'sending' );
	act( () => {
		result.current.getCards( send )[ 0 ].props.onRetryResume!();
	} );
	await waitFor( () => expect( result.current.getCards( send )[ 0 ].props.state ).toBe( 'done' ) );
	expect( attempts ).toBe( 2 );
	expect( fetchMock.mock.calls.filter( ( [ , init ] ) => init.method === 'POST' ) ).toHaveLength(
		1
	);
	expect( result.current.hasPendingApproval ).toBe( false );
} );

it( 'reconciles an already-decided response without resuming', async () => {
	fetchMock.mockResolvedValue(
		response( { proposalId: request.proposalId, state: 'declined', already_decided: true } )
	);
	let resumed = false;
	const send = async () => {
		resumed = true;
	};
	const { result } = renderHook( () => useActionApprovals( options ) );
	act( () => {
		result.current.onHistoryFetch( [ message ] );
		result.current.getCards( send )[ 0 ].props.onDecision( 'allow_once' );
	} );
	await waitFor( () =>
		expect( result.current.getCards( send )[ 0 ].props.state ).toBe( 'declined' )
	);
	expect( resumed ).toBe( false );
	expect( result.current.hasPendingApproval ).toBe( false );
} );

it.each( [ { scopeIdentity: 'user/other-site/agent' }, { sessionId: 'other-session' } ] )(
	'aborts an in-flight decision and drops its result on scope change %o',
	async ( change ) => {
		let resolveFetch: ( value: Response ) => void = () => {};
		fetchMock.mockImplementation(
			() =>
				new Promise< Response >( ( resolve ) => {
					resolveFetch = resolve;
				} )
		);
		let resumed = false;
		const send = async () => {
			resumed = true;
		};
		const { result, rerender } = renderHook( ( props ) => useActionApprovals( props ), {
			initialProps: options,
		} );
		act( () => {
			result.current.onHistoryFetch( [ message ] );
			result.current.getCards( send )[ 0 ].props.onDecision( 'allow_once' );
		} );
		await waitFor( () => expect( fetchMock ).toHaveBeenCalledTimes( 1 ) );
		const signal = fetchMock.mock.calls[ 0 ][ 1 ].signal as AbortSignal;
		rerender( { ...options, ...change } );
		expect( signal.aborted ).toBe( true );
		await act( async () => {
			resolveFetch( response( { proposalId: request.proposalId, state: 'approved' } ) );
		} );
		expect( result.current.getCards( send ) ).toHaveLength( 0 );
		expect( result.current.error ).toBeNull();
		expect( resumed ).toBe( false );
	}
);

it( 'restores one answerable card independently of more than ten newer messages', async () => {
	fetchMock
		.mockResolvedValueOnce( response( { proposalId: request.proposalId, state: 'approved' } ) )
		.mockResolvedValueOnce( response( { proposals: [ { ...request, state: 'succeeded' } ] } ) );
	const loaded: ServerLoadResult = {
		chatId: 456,
		approvals: [ request ],
		sessionId: 'not-a-numeric-id',
		messages: Array.from( { length: 12 }, ( _, index ) => ( {
			...message,
			messageId: `later-${ index }`,
			parts: [ { type: 'text', text: 'Later message' } ],
		} ) ),
		pagination: {
			currentPage: 1,
			totalPages: 1,
			itemsPerPage: 50,
			totalMessages: 12,
			hasMore: false,
		},
	};
	const history = restoreConversationApprovals( loaded );
	expect( fetchMock ).not.toHaveBeenCalled();
	const { result } = renderHook( () => useActionApprovals( { ...options, waitForHistory: true } ) );
	const send = async () => {};
	act( () => {
		result.current.onHistoryFetch( history.messages, history.chatId );
		result.current.onHistoryFetch( history.messages, history.chatId );
	} );
	expect( result.current.getCards( send ) ).toHaveLength( 1 );
	expect( result.current.hasPendingApproval ).toBe( true );
	act( () => {
		result.current.getCards( send )[ 0 ].props.onDecision( 'allow_once' );
	} );
	await waitFor( () => expect( result.current.getCards( send )[ 0 ].props.state ).toBe( 'done' ) );
	expect( result.current.hasPendingApproval ).toBe( false );
} );

it( 'returns a failed decision to pending so another click can retry', async () => {
	jest.spyOn( console, 'error' ).mockImplementation( () => {} );
	fetchMock
		.mockRejectedValueOnce( new Error( 'Network failure' ) )
		.mockResolvedValueOnce(
			response( { proposalId: request.proposalId, state: 'declined', already_decided: true } )
		);
	const send = async () => {};
	const { result } = renderHook( () => useActionApprovals( options ) );
	act( () => {
		result.current.onHistoryFetch( [ message ] );
		result.current.getCards( send )[ 0 ].props.onDecision( 'decline' );
	} );
	await waitFor( () =>
		expect( result.current.getCards( send )[ 0 ].props.state ).toBe( 'pending' )
	);
	act( () => {
		result.current.getCards( send )[ 0 ].props.onDecision( 'decline' );
	} );
	await waitFor( () =>
		expect( result.current.getCards( send )[ 0 ].props.state ).toBe( 'declined' )
	);
	expect( result.current.hasPendingApproval ).toBe( false );
} );

it( 'allows sends immediately after history without approvals and makes no extra request', () => {
	const loaded: ServerLoadResult = {
		chatId: 456,
		messages: [],
		pagination: {
			currentPage: 1,
			totalPages: 1,
			itemsPerPage: 50,
			totalMessages: 0,
			hasMore: false,
		},
	};
	const { result } = renderHook( () => useActionApprovals( { ...options, waitForHistory: true } ) );
	const history = restoreConversationApprovals( loaded );
	act( () => {
		result.current.onHistoryFetch( history.messages, history.chatId );
	} );
	expect( history ).toBe( loaded );
	expect( result.current.isBlocked() ).toBe( false );
	expect( result.current.getCards( async () => {} ) ).toHaveLength( 0 );
	expect( fetchMock ).not.toHaveBeenCalled();
} );

it( 'reconciles an interrupted decision on remount and retries its continuation without POST', async () => {
	const first = renderHook( () => useActionApprovals( options ) );
	act( () => {
		first.result.current.onHistoryFetch( [ message ] );
	} );
	first.unmount();
	const { result } = renderHook( () => useActionApprovals( options ) );
	const restored = {
		...message,
		parts: [
			{ type: 'data' as const, data: { approvalRequest: { ...request, state: 'approved' } } },
		],
	};
	let sends = 0;
	const send = async () => {
		sends++;
	};
	act( () => {
		result.current.onHistoryFetch( [ restored ] );
	} );
	expect( result.current.getCards( send )[ 0 ].props.state ).not.toBe( 'sending' );
	expect( result.current.getCards( send )[ 0 ].props.onRetryResume ).toBeDefined();
	fetchMock.mockResolvedValue( response( { proposals: [ { ...request, state: 'succeeded' } ] } ) );
	act( () => {
		result.current.getCards( send )[ 0 ].props.onRetryResume!();
	} );
	await waitFor( () => expect( result.current.getCards( send )[ 0 ].props.state ).toBe( 'done' ) );
	expect( sends ).toBe( 1 );
	expect( fetchMock.mock.calls.every( ( [ , init ] ) => init.method === 'GET' ) ).toBe( true );
} );
