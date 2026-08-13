/**
 * @jest-environment jsdom
 */
/* eslint-disable import/order -- jest.mock calls must precede imports */
jest.mock( '../../auth/calypso-auth-provider', () => ( {
	createCalypsoAuthProvider: jest.fn( () => ( { type: 'auth-provider' } ) ),
} ) );

import { createCalypsoAuthProvider } from '../../auth/calypso-auth-provider';
import { createWritingOnlyAgentConfig } from '../create-writing-only-agent-config';

describe( 'createWritingOnlyAgentConfig', () => {
	it( 'keeps the provider context while omitting full-Agent editor capabilities', () => {
		const config = createWritingOnlyAgentConfig( {
			sessionId: 'session-1',
			siteId: 123,
			providerId: 'jetpack-ai-sidebar-limited',
			contextProvider: {
				getClientContext: () => ( {
					url: 'https://example.com/wp-admin/post.php',
					pathname: '/wp-admin/post.php',
					search: '',
					environment: 'gutenberg',
					selectedBlockClientId: 'block-1',
				} ),
			},
		} );
		const context = config.contextProvider?.getClientContext();

		expect( createCalypsoAuthProvider ).toHaveBeenCalledWith( 123, {
			logWpcomJwtFailure: true,
		} );
		expect( config.agentId ).toBe( 'wp-orchestrator' );
		expect( config.agentUrl ).toBe( 'https://public-api.wordpress.com/wpcom/v2/ai/agent' );
		expect( context ).toEqual(
			expect.objectContaining( {
				selectedBlockClientId: 'block-1',
				selectedSiteId: 123,
				loadedProviderIds: [ 'jetpack-ai-sidebar-limited' ],
				can_access_zendesk: false,
			} )
		);
		expect( context ).not.toHaveProperty( 'siteEditorActions' );
		expect( context ).not.toHaveProperty( 'constructorArguments' );
	} );
} );
