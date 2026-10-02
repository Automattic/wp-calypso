import {
	applied,
	completed,
	opening,
} from '../../../../packages/agent-components/src/__tests__/fixtures';
import { createMcpComponentSession } from '../bridge';
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

describe( 'MCP component bridge', () => {
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
