import { executeComponentAction } from '../component-action-transport';
import { getComponentOpenings, mergeComponentMessages } from '../component-results';
import { componentHandoffProvider } from '../component-tool-provider';
import { formOpening, opening } from './fixtures/component-opening';
import type { AgentConfig } from '../create-agent-config';
import type { TaskUpdate } from '@automattic/agenttic-client';

jest.mock(
	'@automattic/agenttic-client',
	() => jest.requireActual( '../../../../agenttic-client/src/client/utils/componentHistory' ),
	{ virtual: true }
);

const request = {
	protocol: 'agent-component/0.1' as const,
	instanceId: 'instance-123',
	expectedRevision: 1,
	requestId: 'request-123',
	event: { name: 'tool.execute', values: {} },
};
const config = ( token: string ): AgentConfig => ( {
	agentId: 'wp-orchestrator',
	agentUrl: 'https://example.com/agent',
	sessionId: 'session-123',
	authenticationScope: { siteId: 123, userId: 456 },
	authProvider: async () => ( { Authorization: token } ),
} );

beforeEach( () => {
	globalThis.fetch = jest
		.fn()
		.mockResolvedValue( { ok: true, json: async () => ( { applied: true } ) } );
} );

it( 'uses authenticated site ability transport and sends only the saved action request', async () => {
	await executeComponentAction( config( 'Bearer oauth-token' ), request );
	expect( fetch ).toHaveBeenCalledWith(
		'https://public-api.wordpress.com/wp/v2/sites/123/wp-abilities/v1/abilities/wpcom/component-action/run',
		{
			method: 'POST',
			headers: { Authorization: 'Bearer oauth-token', 'Content-Type': 'application/json' },
			body: JSON.stringify( { input: request } ),
		}
	);
} );

it( 'puts a signed site token only in the existing JWT ability body', async () => {
	await executeComponentAction( config( 'Bearer header.payload.signature' ), request );
	expect( fetch ).toHaveBeenCalledWith(
		'https://public-api.wordpress.com/wp/v2/abilities/wpcom/component-action/run',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify( { token: 'header.payload.signature', input: request } ),
		}
	);
} );

it( 'refuses an unsupported OAuth surface before sending and consumes HTTP errors', async () => {
	await expect(
		executeComponentAction(
			{ ...config( 'Bearer oauth-token' ), authenticationScope: {} },
			request
		)
	).rejects.toThrow( 'Select a supported site' );
	expect( fetch ).not.toHaveBeenCalled();
	jest.mocked( fetch ).mockResolvedValueOnce( { ok: false } as Response );
	await expect( executeComponentAction( config( 'Bearer oauth-token' ), request ) ).rejects.toThrow(
		'The action could not be confirmed'
	);
	expect( fetch ).toHaveBeenCalledTimes( 1 );
} );

it( 'does not dispatch when the chat scope changes while authenticating', async () => {
	let active = true;
	const pending = executeComponentAction( config( 'Bearer oauth-token' ), request, () => active );
	active = false;
	await expect( pending ).rejects.toThrow( 'no longer available' );
	expect( fetch ).not.toHaveBeenCalled();
} );

it( 'defers only a validated opening and never advertises a frontend replacement ability', async () => {
	expect( componentHandoffProvider.getAbilities ).toBeUndefined();
	expect( componentHandoffProvider.getAvailableTools ).toBeUndefined();
	const result = await componentHandoffProvider.executeTool!(
		'wpcom__render_components',
		opening()
	);
	expect( result.returnToAgent ).toBe( false );
	expect( JSON.stringify( result ) ).not.toContain( 'surface' );
	expect( result.result.message ).toContain( 'awaiting user confirmation' );
	const malformed = await componentHandoffProvider.executeTool!( 'wpcom__render_components', {
		...opening(),
		protocol: 'agent-component/0.2',
	} );
	expect( malformed.result.message ).toBe( 'This action is unavailable.' );
} );

it( 'defers an authenticated form and rejects a bare form without action metadata', async () => {
	const result = await componentHandoffProvider.executeTool!(
		'wpcom__render_components',
		formOpening()
	);
	expect( result.result.message ).toContain( 'awaiting user confirmation' );
	const bare = await componentHandoffProvider.executeTool!(
		'wpcom__render_components',
		formOpening().result
	);
	expect( bare.result.message ).toBe( 'This action is unavailable.' );
	const expired = await componentHandoffProvider.executeTool!( 'wpcom__render_components', {
		...formOpening(),
		expiresAt: '2000-01-01T00:00:00+00:00',
	} );
	expect( expired.result.message ).toBe( 'This action is unavailable.' );
} );

it( 'recognizes only authenticated input-required tool data, never prose or running echoes', () => {
	const update: TaskUpdate = {
		id: 'task-123',
		status: {
			state: 'input-required',
			message: {
				role: 'agent',
				kind: 'message',
				messageId: 'message-123',
				parts: [
					{
						type: 'data',
						data: {
							toolId: 'wpcom__render_components',
							toolCallId: 'call-123',
							arguments: opening(),
						},
					},
				],
			},
		},
		final: true,
		text: '',
	};
	expect( getComponentOpenings( update ) ).toHaveLength( 1 );
	expect(
		getComponentOpenings( { ...update, status: { ...update.status, state: 'running' } } )
	).toEqual( [] );
	expect(
		getComponentOpenings( {
			...update,
			status: {
				...update.status,
				message: {
					role: 'agent',
					kind: 'message',
					messageId: 'message-123',
					parts: [ { type: 'text', text: JSON.stringify( opening() ) } ],
				},
			},
		} )
	).toEqual( [] );
} );

it( 'correlates a completed live component marker with its original server tool identity', () => {
	const update: TaskUpdate = {
		id: 'task-123',
		status: {
			state: 'completed',
			message: {
				role: 'agent',
				kind: 'message',
				messageId: 'message-123',
				parts: [
					{
						type: 'data',
						data: {
							toolId: 'wpcom/site-update-form',
							toolCallId: 'call-123',
							result: formOpening(),
						},
					},
					{
						type: 'component-result',
						partVersion: 1,
						toolCallId: 'call-123',
						result: formOpening(),
					},
				],
			},
		},
		final: true,
		text: '',
	};
	expect( getComponentOpenings( update ) ).toEqual( [
		{
			toolId: 'wpcom/site-update-form',
			toolCallId: 'call-123',
			result: formOpening(),
			legacyOnly: false,
		},
	] );
	const uncorrelated = {
		...update,
		status: {
			...update.status,
			message: {
				...update.status.message!,
				parts: update.status.message!.parts.slice( 1 ),
			},
		},
	};
	expect( getComponentOpenings( uncorrelated )[ 0 ].toolId ).toBe( '' );
	const duplicate = {
		...update,
		status: {
			...update.status,
			message: {
				...update.status.message!,
				parts: [ ...update.status.message!.parts, update.status.message!.parts[ 1 ] ],
			},
		},
	};
	expect( getComponentOpenings( duplicate ) ).toHaveLength( 1 );
	const conflict: TaskUpdate = {
		...duplicate,
		status: {
			...duplicate.status,
			message: {
				...duplicate.status.message!,
				parts: [
					...duplicate.status.message!.parts,
					{
						type: 'component-result',
						partVersion: 1,
						toolCallId: 'call-123',
						result: {
							...formOpening(),
							result: { ...formOpening().result, summary: 'A conflicting proposal.' },
						},
					},
				],
			},
		},
	};
	expect( getComponentOpenings( conflict )[ 0 ].result ).toBeUndefined();
} );

it( 'inserts a live card without reordering existing transcript messages', () => {
	const first = { id: 'first', timestamp: 100 };
	const second = { id: 'second', timestamp: 50 };
	const card = { id: 'card', timestamp: 75 };
	expect( mergeComponentMessages( [ first, second ], [ card ] ) ).toEqual( [
		first,
		second,
		card,
	] );
} );
