/** @jest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import { opening } from '../../utils/__tests__/fixtures/component-opening';
import { useComponentResults } from '../use-component-results';
import type { AgentConfig } from '../../utils/create-agent-config';
import type { TaskUpdate } from '@automattic/agenttic-client';

const config: AgentConfig = {
	agentId: 'wp-orchestrator',
	agentUrl: 'https://example.com/agent',
	sessionId: '',
	authenticationScope: { siteId: 123, userId: 456 },
};
const update: TaskUpdate = {
	id: 'task-123',
	sessionId: 'session-123',
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
						toolCallId: 'call-123',
						toolId: 'wpcom__render_components',
						arguments: opening(),
					},
				},
			],
		},
	},
	final: false,
	text: '',
};

it( 'preserves one transient proposal and resumes its original call with the approved summary', async () => {
	const submit = jest.fn().mockResolvedValue( undefined );
	const { result, rerender } = renderHook( ( { current } ) => useComponentResults( current ), {
		initialProps: { current: config },
	} );
	result.current.bindSubmit( submit );
	await act( () => result.current.observe( update ) );
	await act( () => result.current.observe( update ) );
	expect( result.current.messages ).toHaveLength( 1 );
	rerender( { current: { ...config, sessionId: 'session-123' } } );
	expect( result.current.messages ).toHaveLength( 1 );
	await result.current.messages[ 0 ].componentResult!.onContinue( 'The plugin was activated.' );
	expect( submit ).toHaveBeenCalledWith( 'The plugin was activated.', {
		type: 'tool_result',
		toolCallId: 'call-123',
		toolId: 'wpcom__render_components',
		sessionId: 'session-123',
		waitForIdle: true,
		componentInstanceId: opening().instanceId,
	} );
} );

it( 'discards old controls and rejects continuation after a new conversation or unmount', async () => {
	const submit = jest.fn();
	const { result, rerender, unmount } = renderHook(
		( { current } ) => useComponentResults( current ),
		{
			initialProps: { current: config },
		}
	);
	result.current.bindSubmit( submit );
	await act( () => result.current.observe( update ) );
	const previous = result.current.messages[ 0 ].componentResult!;
	rerender( { current: { ...config, sessionId: 'different-session' } } );
	expect( result.current.messages ).toHaveLength( 0 );
	await act( () => result.current.observe( update ) );
	expect( result.current.messages ).toHaveLength( 0 );
	await expect( previous.onContinue( 'Completed.' ) ).rejects.toThrow( 'chat could not continue' );
	await act( () => result.current.observe( { ...update, sessionId: 'different-session' } ) );
	const latest = result.current.messages[ 0 ].componentResult!;
	unmount();
	await expect( latest.onContinue( 'Completed.' ) ).rejects.toThrow( 'chat could not continue' );
	expect( submit ).not.toHaveBeenCalled();
} );

it.each( [
	{ current: { ...config, authenticationScope: {} }, result: opening() },
	{ current: config, result: { ...opening(), protocol: 'agent-component/0.2' } },
] )( 'shows readable fallback for unsupported scope or malformed opening', async ( fixture ) => {
	const { result } = renderHook( () => useComponentResults( fixture.current ) );
	const malformed: TaskUpdate = {
		...update,
		status: {
			...update.status,
			message: {
				...update.status.message!,
				parts: [
					{
						type: 'data',
						data: {
							toolId: 'wpcom__render_components',
							toolCallId: 'call-123',
							arguments: fixture.result,
						},
					},
				],
			},
		},
	};
	await act( () => result.current.observe( malformed ) );
	expect( result.current.messages[ 0 ].componentResult ).toBeUndefined();
	expect( result.current.messages[ 0 ].content[ 0 ].text ).toBe( 'This action is unavailable.' );
} );

it( 'invalidates the saved transport immediately after switching the authenticated site', async () => {
	const { result, rerender } = renderHook( ( { current } ) => useComponentResults( current ), {
		initialProps: { current: config },
	} );
	await act( () => result.current.observe( update ) );
	const transport = result.current.messages[ 0 ].componentResult!.transport;
	rerender( { current: { ...config, authenticationScope: { siteId: 987, userId: 456 } } } );
	expect( result.current.messages ).toHaveLength( 0 );
	await expect(
		transport( {
			protocol: 'agent-component/0.1',
			instanceId: 'instance-123',
			expectedRevision: 1,
			requestId: 'request-123',
			event: { name: 'tool.execute', values: {} },
		} )
	).rejects.toThrow( 'no longer available' );
} );

it( 'drops an expired payload without restoring it on repeated updates', async () => {
	const { result } = renderHook( () => useComponentResults( config ) );
	await act( () => result.current.observe( update ) );
	act( () => result.current.messages[ 0 ].componentResult!.onExpire!() );
	await act( () => result.current.observe( update ) );
	expect( result.current.messages ).toHaveLength( 1 );
	expect( result.current.messages[ 0 ].componentResult ).toBeUndefined();
	expect( result.current.messages[ 0 ].content[ 0 ].text ).toBe( 'This action is unavailable.' );
} );

it( 'expires the payload even when the card renderer never loads', async () => {
	jest.useFakeTimers();
	try {
		const { result } = renderHook( () => useComponentResults( config ) );
		await act( () => result.current.observe( update ) );
		const previous = result.current.messages[ 0 ].componentResult!;
		act( () => jest.advanceTimersByTime( 60 * 60 * 1000 ) );
		expect( result.current.messages[ 0 ].componentResult ).toBeUndefined();
		await expect( previous.onContinue( 'Completed.' ) ).rejects.toThrow(
			'chat could not continue'
		);
	} finally {
		jest.useRealTimers();
	}
} );
