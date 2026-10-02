/** @jest-environment jsdom */
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import ComponentCard from '../../components/component-card';
import { formOpening, opening } from '../../utils/__tests__/fixtures/component-opening';
import { useComponentResults } from '../use-component-results';
import type { AgentConfig } from '../../utils/create-agent-config';
import type { TaskUpdate } from '@automattic/agenttic-client';

jest.mock( 'i18n-calypso', () => ( { getLocaleSlug: () => 'en' } ) );

jest.mock(
	'@automattic/agenttic-client',
	() => jest.requireActual( '../../../../agenttic-client/src/client/utils/componentHistory' ),
	{ virtual: true }
);

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
	expect( result.current.messages[ 0 ].componentResult!.presentationFailed ).toBeUndefined();
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

it.each( [
	{
		toolId: 'wpcom__render_components',
		arguments: { ...opening(), summary: 'A conflicting operation.' },
	},
	{ toolId: 'wpcom/render-components', arguments: opening() },
] )(
	'disables the existing controller when the same tool call supplies a conflicting opening',
	async ( data ) => {
		const { result } = renderHook( () => useComponentResults( config ) );
		await act( () => result.current.observe( update ) );
		const previous = result.current.messages[ 0 ].componentResult!;
		const view = render( <ComponentCard options={ previous } /> );
		expect( screen.getByRole( 'button' ) ).toBeEnabled();
		const conflict: TaskUpdate = {
			...update,
			status: {
				...update.status,
				message: {
					...update.status.message!,
					parts: [
						{
							type: 'data',
							data: {
								toolCallId: 'call-123',
								...data,
							},
						},
					],
				},
			},
		};
		await act( () => result.current.observe( conflict ) );
		const options = result.current.messages[ 0 ].componentResult!;
		expect( result.current.messages ).toHaveLength( 1 );
		expect( options.result ).toEqual( previous.result );
		expect( options.transport ).toBe( previous.transport );
		expect( options.presentationFailed ).toBe( true );
		view.rerender( <ComponentCard options={ options } /> );
		expect( screen.queryByRole( 'button' ) ).not.toBeInTheDocument();
		expect( screen.getByText( previous.result.summary ) ).toBeVisible();
	}
);

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
	{ current: config, result: formOpening().result },
	{ current: config, result: formOpening() },
	{ current: config, result: { ...formOpening(), actionBindings: {} }, serverResult: true },
	{
		current: config,
		result: { ...formOpening(), expiresAt: '2000-01-01T00:00:00+00:00' },
		serverResult: true,
	},
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
							...( 'serverResult' in fixture
								? { result: fixture.result }
								: { arguments: fixture.result } ),
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

it( 'submits authenticated form bindings and continues the original tool call after completion', async () => {
	const proposal = formOpening();
	const completed = {
		...proposal.result,
		revision: 2,
		status: 'completed',
		summary: 'The site name is now Field Notes.',
		surface: {
			protocol: 'minimal-ai-ui/0.1',
			rootId: 'root',
			components: {
				root: { id: 'root', type: 'Column', children: [ 'summary' ] },
				summary: {
					id: 'summary',
					type: 'Text',
					variant: 'body',
					content: { text: 'The site name is now Field Notes.' },
				},
			},
			data: {},
		},
	};
	const fetch = jest.fn().mockImplementation( async ( _url, options ) => {
		const { input } = JSON.parse( options.body );
		return {
			ok: true,
			json: async () => ( {
				protocol: 'agent-component/0.1',
				requestId: input.requestId,
				outcome: 'applied',
				current: {
					protocol: 'agent-component/0.1',
					resolvedLocale: 'en-US',
					state: 'completed',
					instanceId: proposal.result.instanceId,
					revision: 2,
					allowedActions: [],
					expiresAt: proposal.expiresAt,
					request: {
						state: 'settled',
						requestId: input.requestId,
						outcome: 'applied',
						revision: 2,
					},
					result: completed,
				},
			} ),
		};
	} );
	globalThis.fetch = fetch;
	const submit = jest.fn().mockResolvedValue( undefined );
	const { result } = renderHook( () =>
		useComponentResults( {
			...config,
			authProvider: async () => ( { Authorization: 'Bearer oauth-token' } ),
		} )
	);
	result.current.bindSubmit( submit );
	await act( () =>
		result.current.observe( {
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
							},
						},
						{
							type: 'component-result',
							partVersion: 1,
							toolCallId: 'call-123',
							result: proposal,
						},
					],
				},
			},
		} )
	);
	const options = result.current.messages[ 0 ].componentResult!;
	expect( options ).toMatchObject( {
		result: proposal.result,
		allowedActions: proposal.allowedActions,
		actionBindings: proposal.actionBindings,
		expiresAt: proposal.expiresAt,
	} );
	render( <ComponentCard options={ options } /> );
	fireEvent.change( screen.getByRole( 'textbox', { name: 'Site name' } ), {
		target: { value: 'Field Notes' },
	} );
	fireEvent.click( screen.getByRole( 'button', { name: 'Save site name' } ) );
	await waitFor( () => expect( submit ).toHaveBeenCalledTimes( 1 ) );
	expect( screen.getByText( completed.summary ) ).toBeVisible();
	expect( fetch ).toHaveBeenCalledTimes( 1 );
	const { input } = JSON.parse( fetch.mock.calls[ 0 ][ 1 ].body );
	expect( input ).toMatchObject( {
		instanceId: proposal.result.instanceId,
		expectedRevision: 1,
		event: { name: 'site.update', values: { '/site/name': 'Field Notes' } },
	} );
	expect( submit ).toHaveBeenCalledWith( completed.summary, {
		type: 'tool_result',
		toolCallId: 'call-123',
		toolId: 'wpcom__render_components',
		sessionId: 'session-123',
		waitForIdle: true,
		componentInstanceId: proposal.result.instanceId,
	} );
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

it( 'shows fallback for a live marker without its original server tool identity', async () => {
	const { result } = renderHook( () => useComponentResults( config ) );
	await act( () =>
		result.current.observe( {
			...update,
			status: {
				state: 'completed',
				message: {
					...update.status.message!,
					parts: [
						{
							type: 'component-result',
							partVersion: 1,
							toolCallId: 'call-123',
							result: formOpening(),
						},
					],
				},
			},
		} )
	);
	expect( result.current.messages[ 0 ].componentResult ).toBeUndefined();
	expect( result.current.messages[ 0 ].content[ 0 ].text ).toBe( 'This action is unavailable.' );
} );

it( 'drops the saved result and preserves generic text when the controller reports expiry', async () => {
	const { result } = renderHook( () => useComponentResults( config ) );
	await act( () => result.current.observe( update ) );
	const options = result.current.messages[ 0 ].componentResult!;
	expect( options.result ).toEqual( opening() );
	act( () => options.onExpire!() );
	await act( () => result.current.observe( update ) );
	expect( result.current.messages ).toHaveLength( 1 );
	expect( result.current.messages[ 0 ].componentResult ).toBeUndefined();
	expect( result.current.messages[ 0 ].content ).toEqual( [
		{ type: 'text', text: 'This action is unavailable.' },
	] );
	expect( JSON.stringify( result.current.messages ) ).not.toContain( opening().summary );
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

it( 'expires an unloaded form at its authenticated deadline without renewing repeated openings', async () => {
	jest.useFakeTimers();
	try {
		const proposal = { ...formOpening(), expiresAt: new Date( Date.now() + 1000 ).toISOString() };
		const formUpdate: TaskUpdate = {
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
								result: proposal,
							},
						},
					],
				},
			},
		};
		const { result } = renderHook( () => useComponentResults( config ) );
		await act( () => result.current.observe( formUpdate ) );
		const options = result.current.messages[ 0 ].componentResult!;
		act( () => jest.advanceTimersByTime( 500 ) );
		await act( () => result.current.observe( formUpdate ) );
		expect( result.current.messages[ 0 ].componentResult ).toBe( options );
		act( () => jest.advanceTimersByTime( 500 ) );
		expect( result.current.messages[ 0 ].componentResult ).toBeUndefined();
		await expect( options.onContinue( 'Completed.' ) ).rejects.toThrow( 'chat could not continue' );
	} finally {
		jest.useRealTimers();
	}
} );
