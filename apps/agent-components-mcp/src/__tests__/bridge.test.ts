import {
	applied,
	completed,
	opening,
} from '../../../../packages/agent-components/src/__tests__/fixtures';
import { createMcpComponentSession } from '../bridge';
import type { ComponentOpening } from '@automattic/agent-components';
import type { App } from '@modelcontextprotocol/ext-apps';

function bridge() {
	return {
		getHostCapabilities: jest.fn< ReturnType< App[ 'getHostCapabilities' ] >, [] >( () => ( {
			serverTools: {},
		} ) ),
		callServerTool: jest.fn<
			ReturnType< App[ 'callServerTool' ] >,
			Parameters< App[ 'callServerTool' ] >
		>(),
		sendMessage: jest
			.fn< ReturnType< App[ 'sendMessage' ] >, Parameters< App[ 'sendMessage' ] > >()
			.mockResolvedValue( {} ),
	};
}

function formOpening(): ComponentOpening {
	const result = opening();
	return {
		protocol: 'agent-component/0.1',
		result: {
			...result,
			component: 'ability-form',
			surface: {
				...result.surface,
				components: {
					...result.surface.components,
					root: { id: 'root', type: 'Column', children: [ 'proposal', 'title', 'goal', 'run' ] },
					proposal: {
						id: 'proposal',
						type: 'Text',
						variant: 'body',
						content: { path: '/site' },
					},
					title: {
						id: 'title',
						type: 'TextField',
						label: 'Title',
						path: '/title',
						inputMode: 'shortText',
					},
					goal: {
						id: 'goal',
						type: 'ChoicePicker',
						label: 'Goal',
						path: '/goal',
						mode: 'single',
						options: [
							{ value: 'publish', label: 'Publish' },
							{ value: 'sell', label: 'Sell' },
						],
					},
				},
				data: { title: 'Original', goal: 'publish', site: 'Example Site' },
			},
		},
		allowedActions: [ 'tool.execute' ],
		actionBindings: { 'tool.execute': [ '/title', '/goal' ] },
		expiresAt: '2099-09-30T12:00:00+00:00',
	};
}

describe( 'MCP component bridge', () => {
	it( 'forwards authenticated form eligibility and sends only editable values', async () => {
		const host = bridge();
		host.callServerTool.mockImplementation( async ( { arguments: request } ) => {
			const response = applied( String( request?.requestId ) );
			response.current.result.component = 'ability-form';
			return { content: [], structuredContent: response };
		} );
		const session = createMcpComponentSession( formOpening(), host );
		expect( session.getSnapshot().allowedActions ).toEqual( new Set( [ 'tool.execute' ] ) );
		expect( session.getSnapshot().actionBindings ).toEqual( {
			'tool.execute': [ '/title', '/goal' ],
		} );
		await session.submit( {
			name: 'tool.execute',
			values: { '/title': 'Updated', '/goal': 'sell', '/site': 'Another Site', '/siteId': '456' },
		} );
		expect( host.callServerTool ).not.toHaveBeenCalled();
		expect( session.getSnapshot().phase ).toBe( 'ready' );
		expect( session.getSnapshot().error ).toBe( 'Check the form values and try again.' );
		await session.submit( {
			name: 'tool.execute',
			values: { '/title': 'Updated', '/goal': 'sell' },
		} );
		expect( host.callServerTool ).toHaveBeenCalledTimes( 1 );
		expect( host.callServerTool ).toHaveBeenCalledWith( {
			name: 'wpcom-component-action',
			arguments: {
				protocol: 'agent-component/0.1',
				instanceId: 'instance-123',
				expectedRevision: 1,
				requestId: expect.any( String ),
				event: { name: 'tool.execute', values: { '/title': 'Updated', '/goal': 'sell' } },
			},
		} );
		expect( session.getSnapshot().phase ).toBe( 'completed' );
		expect( host.sendMessage ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [ 'bare', 'legacy-name', 'missing-bindings' ] )(
		'rejects form openings with %s metadata',
		( variant ) => {
			const opening = formOpening();
			let value: unknown = { ...opening, actionBindings: undefined };
			if ( variant === 'bare' ) {
				value = opening.result;
			} else if ( variant === 'legacy-name' ) {
				value = { ...opening.result, component: 'button-action' };
			}
			const host = bridge();
			expect( () => createMcpComponentSession( value, host ) ).toThrow();
			expect( host.callServerTool ).not.toHaveBeenCalled();
		}
	);

	it( 'forwards the locale and sends the approved completed summary to the conversation', async () => {
		const host = bridge();
		host.callServerTool.mockImplementation( async ( { arguments: request } ) => ( {
			content: [],
			structuredContent: applied( String( request?.requestId ) ),
		} ) );
		const session = createMcpComponentSession( opening(), host, 'es-MX' );
		await session.submit( 'tool.execute' );
		expect( host.callServerTool ).toHaveBeenCalledWith( {
			name: 'wpcom-component-action',
			arguments: {
				protocol: 'agent-component/0.1',
				instanceId: 'instance-123',
				expectedRevision: 1,
				requestId: expect.any( String ),
				locale: 'es-MX',
				event: { name: 'tool.execute', values: {} },
			},
		} );
		expect( session.getSnapshot().result ).toEqual( completed() );
		expect( host.sendMessage ).toHaveBeenCalledWith( {
			role: 'user',
			content: [ { type: 'text', text: completed().summary } ],
		} );
		expect( host.sendMessage ).toHaveBeenCalledTimes( 1 );
	} );

	it.each( [ undefined, { ...opening(), protocol: 'agent-component/9.0' } ] )(
		'rejects malformed opening %p',
		( result ) => {
			expect( () => createMcpComponentSession( result, bridge() ) ).toThrow();
		}
	);

	it( 'rejects a host without authenticated server tool support', () => {
		const host = bridge();
		host.getHostCapabilities.mockReturnValue( {} );
		expect( () => createMcpComponentSession( opening(), host ) ).toThrow();
		expect( host.callServerTool ).not.toHaveBeenCalled();
	} );

	it.each( [ 'missing', 'reordered', 'tool-error' ] )(
		'consumes an unverified %s response without continuation',
		async ( failure ) => {
			const host = bridge();
			host.callServerTool.mockImplementation( async () => ( {
				content: [],
				structuredContent: failure === 'missing' ? undefined : applied( 'another-request' ),
				isError: failure === 'tool-error',
			} ) );
			const session = createMcpComponentSession( opening(), host );
			await session.submit( 'tool.execute' );
			expect( session.getSnapshot().phase ).toBe( 'failed' );
			expect( host.sendMessage ).not.toHaveBeenCalled();
			await session.submit( 'tool.execute' );
			expect( host.callServerTool ).toHaveBeenCalledTimes( 1 );
		}
	);

	it( 'keeps the confirmed replacement when the host refuses continuation', async () => {
		const host = bridge();
		host.callServerTool.mockImplementation( async ( { arguments: request } ) => ( {
			content: [],
			structuredContent: applied( String( request?.requestId ) ),
		} ) );
		host.sendMessage.mockResolvedValue( { isError: true } );
		const session = createMcpComponentSession( opening(), host );
		await session.submit( 'tool.execute' );
		expect( session.getSnapshot().result ).toEqual( completed() );
		expect( session.getSnapshot().error ).toMatch( /agent could not continue/ );
		await session.submit( 'tool.execute' );
		expect( host.callServerTool ).toHaveBeenCalledTimes( 1 );
		expect( host.sendMessage ).toHaveBeenCalledTimes( 1 );
	} );
} );
