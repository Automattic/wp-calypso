// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createClient } from '../../client/index';
import { extractToolCallsFromMessage } from '../../client/utils/core';
import { getAgentManager } from '../agentManager';
import { extractNewContentFromMessage } from '../conversationUtils';
import { serverMessageToMessage } from '../serverTypes';
import { useAgentChat } from '../useAgentChat';
import type { Client, Message, TaskUpdate } from '../../client/types/index';
import type { ApprovalRequest } from '../actionApprovals';

vi.mock( '../../client/index', async ( original ) => ( {
	...( await original< typeof import( '../../client/index' ) >() ),
	createClient: vi.fn(),
} ) );
const request: ApprovalRequest = {
	version: 1,
	proposalId: 'proposal',
	chatId: 123,
	consumer: 'wp-agent',
	origin: 'execute',
	state: 'pending',
	ability: 'wpcom/example',
	description: 'Remove plugin from site',
	notice: 'Data may be removed',
	allowForChat: false,
};
const message = ( id: string, proposalId = 'proposal' ): Message => ( {
	messageId: id,
	kind: 'message',
	role: 'agent',
	parts: [ { type: 'data', data: { approvalRequest: { ...request, proposalId } } } ],
} );

beforeEach( () => {
	getAgentManager().clear();
	sessionStorage.clear();
	localStorage.clear();
} );
afterEach( () => {
	cleanup();
	getAgentManager().clear();
} );

describe( 'approval transcript', () => {
	it.each( [ 1, 2 ] )(
		'retains %i distinct proposals across status, final, and history echoes',
		async ( count ) => {
			let release: () => void = () => {};
			const gate = new Promise< void >( ( resolve ) => {
				release = resolve;
			} );
			const client: Client = {
				sendMessage: vi.fn(),
				continueTask: vi.fn(),
				getTask: vi.fn(),
				cancelTask: vi.fn(),
				sendMessageStream: async function* (): AsyncIterable< TaskUpdate > {
					for ( let index = 0; index < count; index++ ) {
						yield {
							id: 'task',
							text: '',
							final: false,
							kind: 'status',
							status: {
								state: 'input-required',
								message: message( `status-${ index }`, `proposal-${ index }` ),
							},
						};
					}
					await gate;
					for ( let index = 0; index < count; index++ ) {
						yield {
							id: 'task',
							text: '',
							final: true,
							status: {
								state: 'input-required',
								message: message( `final-${ index }`, `proposal-${ index }` ),
							},
						};
					}
				},
			};
			vi.mocked( createClient ).mockReturnValue( client );
			const { result } = renderHook( () =>
				useAgentChat( {
					agentId: 'approval-test',
					agentUrl: 'https://example.com',
					sessionId: 'session',
					enableActionApprovals: true,
				} )
			);
			await act( async () => {} );
			let send: Promise< void >;
			await act( async () => {
				send = result.current.onSubmit( 'Remove plugin' );
			} );
			const cards = () =>
				result.current.messages.filter( ( item ) => item.id.startsWith( 'approval:' ) );
			expect( cards() ).toHaveLength( count );
			await act( async () => {
				release();
				await send;
			} );
			expect( result.current.isProcessing ).toBe( false );
			expect( getAgentManager().isTurnInFlight( 'approval-test' ) ).toBe( false );
			expect( cards() ).toHaveLength( count );
			await act( async () => {
				await result.current.loadMessages(
					Array.from( { length: count }, ( _, index ) =>
						serverMessageToMessage(
							{
								message_id: index,
								role: 'bot',
								content: '',
								context: { approvalRequest: { ...request, proposalId: `proposal-${ index }` } },
								created_at: '2026-01-01 00:00:00',
							},
							true
						)
					).flatMap( ( item ) => [ item, { ...item, messageId: `${ item.messageId }-echo` } ] )
				);
			} );
			expect( cards() ).toHaveLength( count );
		}
	);

	it( 'queues a hidden approval resume behind an active send without a pending user question', async () => {
		let release: () => void = () => {};
		const gate = new Promise< void >( ( resolve ) => {
			release = resolve;
		} );
		let finish: () => void = () => {};
		const resumeGate = new Promise< void >( ( resolve ) => {
			finish = resolve;
		} );
		const outbound: Message[] = [];
		const client = {
			sendMessage: vi.fn(),
			continueTask: vi.fn(),
			getTask: vi.fn(),
			cancelTask: vi.fn(),
			sendMessageStream: async function* ( params: {
				message: Message;
			} ): AsyncIterable< TaskUpdate > {
				outbound.push( params.message );
				if ( outbound.length === 1 ) {
					await gate;
				}
				if ( outbound.length === 2 ) {
					await resumeGate;
				}
				yield {
					id: 'task',
					text: '',
					final: true,
					status: {
						state: 'completed',
						message: {
							messageId: `reply-${ outbound.length }`,
							kind: 'message',
							role: 'agent',
							parts: [ { type: 'text', text: 'Complete' } ],
						},
					},
				};
			},
		} as Client;
		vi.mocked( createClient ).mockReturnValue( client );
		const { result } = renderHook( () =>
			useAgentChat( {
				agentId: 'resume-test',
				agentUrl: 'https://example.com',
				sessionId: 'session',
				enableActionApprovals: true,
			} )
		);
		await act( async () => {} );
		let first: Promise< void >;
		let resume: Promise< void >;
		await act( async () => {
			first = result.current.onSubmit( 'Remove plugin' );
		} );
		await act( async () => {
			resume = result.current.onSubmit( '', {
				type: 'approval_resume',
				approvalResume: { proposalId: 'proposal', chatId: 123 },
			} );
		} );
		expect( outbound ).toHaveLength( 1 );
		await act( async () => {
			release();
			await first;
		} );
		expect( getAgentManager().isTurnInFlight( 'resume-test' ) ).toBe( false );
		await act( async () => {
			finish();
			await resume;
		} );
		expect( outbound ).toHaveLength( 2 );
		expect( outbound[ 1 ].parts ).toEqual( [
			{ type: 'data', data: { approvalResume: { proposalId: 'proposal', chatId: 123 } } },
		] );
		expect( result.current.messages.filter( ( item ) => item.role === 'user' ) ).toHaveLength( 1 );
	} );

	it( 'keeps approval display data opt-in and out of executable tool calls', () => {
		const approval = message( 'one' );
		expect( extractNewContentFromMessage( approval ).parts ).toHaveLength( 0 );
		expect( extractNewContentFromMessage( approval, true ).parts ).toHaveLength( 1 );
		const tool = {
			type: 'data' as const,
			data: { toolCallId: 'tool', toolId: 'test', arguments: {} },
		};
		expect(
			extractToolCallsFromMessage( { ...approval, parts: [ ...approval.parts, tool ] } )
		).toEqual( [ tool ] );
		expect(
			extractToolCallsFromMessage( {
				...approval,
				parts: [ { ...tool, data: { ...tool.data, approvalRequest: request } } ],
			} )
		).toHaveLength( 0 );
	} );
} );

it( 'preserves the original anchor timestamp when authoritative records update a card', async () => {
	const { normalizeApprovalMessages } = await import( '../actionApprovals' );
	const first = { ...message( 'anchor' ), metadata: { timestamp: 100 } };
	const echo = { ...message( 'echo' ), metadata: { timestamp: 300 } };
	const records = normalizeApprovalMessages( [ first, echo ] );
	expect( records ).toHaveLength( 1 );
	expect( records[ 0 ].metadata?.timestamp ).toBe( 100 );
} );

it( 'dispatches exactly one new control stream on retry after a failed continuation', async () => {
	const outbound: Message[] = [];
	const client = {
		sendMessage: vi.fn(),
		continueTask: vi.fn(),
		getTask: vi.fn(),
		cancelTask: vi.fn(),
		sendMessageStream: async function* ( params: {
			message: Message;
		} ): AsyncIterable< TaskUpdate > {
			outbound.push( params.message );
			if ( outbound.length === 1 ) {
				throw new Error( 'Stream failed' );
			}
			yield { id: 'retry', text: '', final: true, status: { state: 'completed' } };
		},
	} as Client;
	vi.mocked( createClient ).mockReturnValue( client );
	const { result } = renderHook( () =>
		useAgentChat( {
			agentId: 'retry-test',
			agentUrl: 'https://example.com',
			sessionId: 'retry-session',
			enableActionApprovals: true,
		} )
	);
	await act( async () => {} );
	const submit = () =>
		result.current.onSubmit( '', {
			type: 'approval_resume',
			approvalResume: { proposalId: 'proposal', chatId: 123 },
		} );
	await act( async () => {
		await expect( submit() ).rejects.toThrow();
	} );
	expect( result.current.isProcessing ).toBe( false );
	await act( async () => {
		await submit();
	} );
	expect( outbound ).toHaveLength( 2 );
	expect( outbound[ 1 ].parts ).toEqual( [
		{ type: 'data', data: { approvalResume: { proposalId: 'proposal', chatId: 123 } } },
	] );
	expect( result.current.isProcessing ).toBe( false );
	expect( result.current.messages.filter( ( item ) => item.role === 'user' ) ).toHaveLength( 0 );
} );
