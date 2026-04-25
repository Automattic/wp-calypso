/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '../../auth/calypso-auth-provider', () => ( {
	createCalypsoAuthProvider: jest.fn( () => ( { type: 'auth-provider' } ) ),
} ) );

jest.mock( '../can-connect-to-zendesk', () => ( {
	canConnectToZendesk: jest.fn( () => Promise.resolve( false ) ),
} ) );

import { createAgentConfig } from '../create-agent-config';

function setAgentsManagerData( data: Record< string, unknown > ) {
	( window as unknown as { agentsManagerData?: Record< string, unknown > } ).agentsManagerData =
		data;
}

describe( 'createAgentConfig', () => {
	afterEach( () => {
		delete ( window as unknown as { agentsManagerData?: Record< string, unknown > } )
			.agentsManagerData;
	} );

	it( 'does not add reader page context for regular agents', async () => {
		setAgentsManagerData( {
			currentPost: { id: 1, title: 'Reader post' },
			siteName: 'Reader Site',
			siteUrl: 'https://example.com',
		} );

		const config = await createAgentConfig( {
			sessionId: 'session-1',
			agentId: 'wp-orchestrator',
		} );
		const context = config.contextProvider?.getClientContext();

		expect( context ).not.toHaveProperty( 'currentPost' );
		expect( context ).not.toHaveProperty( 'siteName' );
		expect( context ).not.toHaveProperty( 'siteUrl' );
	} );

	it( 'adds reader page context for Reader Chat agents', async () => {
		const currentPost = { id: 1, title: 'Reader post' };
		setAgentsManagerData( {
			currentPost,
			siteName: 'Reader Site',
			siteUrl: 'https://example.com',
		} );

		const config = await createAgentConfig( {
			sessionId: 'session-1',
			agentId: 'reader-chat',
		} );
		const context = config.contextProvider?.getClientContext();

		expect( context ).toEqual(
			expect.objectContaining( {
				currentPost,
				siteName: 'Reader Site',
				siteUrl: 'https://example.com',
			} )
		);
	} );
} );
