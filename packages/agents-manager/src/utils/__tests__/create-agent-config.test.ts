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

import { DOLLY_AGENT_ID } from '../../constants';
import { createAgentConfig } from '../create-agent-config';
import { canConnectToZendesk } from '../can-connect-to-zendesk';
import { clearSiteEditorActions, setSiteEditorAction } from '../site-editor-context';
import { createCalypsoAuthProvider } from '../../auth/calypso-auth-provider';
import { getSessionId } from '../agent-session';

const mockCanConnectToZendesk = canConnectToZendesk as jest.Mock;
const mockCreateCalypsoAuthProvider = createCalypsoAuthProvider as jest.Mock;

function setAgentsManagerData( data: Record< string, unknown > ) {
	( window as unknown as { agentsManagerData?: Record< string, unknown > } ).agentsManagerData =
		data;
}

describe( 'createAgentConfig', () => {
	beforeEach( () => {
		mockCanConnectToZendesk.mockClear();
		mockCreateCalypsoAuthProvider.mockClear();
	} );

	afterEach( () => {
		delete ( window as unknown as { agentsManagerData?: Record< string, unknown > } )
			.agentsManagerData;
		document.body.className = '';
		clearSiteEditorActions();
		sessionStorage.clear();
	} );

	it( 'does not add reader page context for regular agents', async () => {
		setAgentsManagerData( {
			currentPost: { id: 1, title: 'Reader post' },
			siteName: 'Reader Site',
			siteUrl: 'https://example.com',
		} );

		const config = await createAgentConfig( {
			sessionId: 'session-1',
			sessionSiteKey: 'no-site',
			agentId: 'wp-orchestrator',
		} );
		const context = config.contextProvider?.getClientContext();

		expect( mockCanConnectToZendesk ).toHaveBeenCalledTimes( 1 );
		expect( mockCreateCalypsoAuthProvider ).toHaveBeenCalledWith( undefined, {
			logWpcomJwtFailure: true,
		} );
		expect( context ).not.toHaveProperty( 'currentPost' );
		expect( context ).not.toHaveProperty( 'siteName' );
		expect( context ).not.toHaveProperty( 'siteUrl' );
	} );

	it( 'saves server-assigned session IDs as the tab session via onSessionIdChange', async () => {
		sessionStorage.clear();

		const config = await createAgentConfig( {
			sessionId: '',
			sessionSiteKey: 'no-site',
			agentId: 'wp-orchestrator',
		} );
		config.onSessionIdChange?.( 'server-session-id' );

		expect( getSessionId( 'wp-orchestrator' ) ).toBe( 'server-session-id' );
	} );

	// The callback can fire after a logout and login in the same tab, so it must
	// write under the user captured at creation, not whoever is current then.
	it( 'persists server-assigned sessions under the captured sessionUserId', async () => {
		const config = await createAgentConfig( {
			sessionId: '',
			sessionSiteKey: '111',
			sessionUserId: 101,
			agentId: 'wp-orchestrator',
		} );
		config.onSessionIdChange?.( 'server-session-id' );

		expect( getSessionId( undefined, '111', 101 ) ).toBe( 'server-session-id' );
		expect( getSessionId( undefined, '111', 202 ) ).toBe( '' );
	} );

	it( 'persists server-assigned sessions under an explicit sessionSiteKey', async () => {
		const config = await createAgentConfig( {
			sessionId: '',
			sessionSiteKey: '111',
			agentId: 'wp-orchestrator',
		} );
		config.onSessionIdChange?.( 'server-session-id' );

		expect( getSessionId( undefined, '111' ) ).toBe( 'server-session-id' );
		expect( getSessionId() ).toBe( '' );
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
			sessionSiteKey: 'no-site',
			agentId: 'reader-chat',
		} );
		const context = config.contextProvider?.getClientContext();

		expect( mockCanConnectToZendesk ).not.toHaveBeenCalled();
		expect( mockCreateCalypsoAuthProvider ).toHaveBeenCalledWith( undefined, {
			logWpcomJwtFailure: false,
		} );
		expect( context ).toEqual( expect.objectContaining( { can_access_zendesk: false } ) );
		expect( context ).toEqual(
			expect.objectContaining( {
				currentPost,
				siteName: 'Reader Site',
				siteUrl: 'https://example.com',
			} )
		);
	} );

	it( 'uses the Reader Chat host site ID when no site prop is available', async () => {
		setAgentsManagerData( {
			siteId: '247750866',
		} );

		const config = await createAgentConfig( {
			sessionId: 'session-1',
			sessionSiteKey: 'no-site',
			agentId: 'reader-chat',
		} );
		const context = config.contextProvider?.getClientContext();

		expect( context ).toEqual( expect.objectContaining( { selectedSiteId: 247750866 } ) );
	} );

	it( 'adds site editor constructor arguments from the host environment', async () => {
		const config = await createAgentConfig( {
			sessionId: 'session-1',
			sessionSiteKey: 'no-site',
			agentId: DOLLY_AGENT_ID,
			environment: 'site-editor',
			version: '1.2.3',
		} );
		const context = config.contextProvider?.getClientContext();

		expect( context ).toEqual(
			expect.objectContaining( {
				constructorArguments: {
					client: 'site-editor',
					version: '1.2.3',
				},
			} )
		);
	} );

	it( 'adds site editor constructor arguments when the route is site-editor.php', async () => {
		const config = await createAgentConfig( {
			sessionId: 'session-1',
			sessionSiteKey: 'no-site',
			agentId: DOLLY_AGENT_ID,
			currentRoute: '/wp-admin/site-editor.php',
		} );
		const context = config.contextProvider?.getClientContext();

		expect( context ).toEqual(
			expect.objectContaining( {
				constructorArguments: {
					client: 'site-editor',
				},
			} )
		);
	} );

	it( 'adds loaded provider IDs to default client context', async () => {
		const config = await createAgentConfig( {
			sessionId: 'session-1',
			sessionSiteKey: 'no-site',
			agentId: DOLLY_AGENT_ID,
			providerIds: [ 'jetpack-ai-sidebar', 'woocommerce-ai' ],
		} );
		const context = config.contextProvider?.getClientContext();

		expect( context ).toEqual(
			expect.objectContaining( {
				loadedProviderIds: [ 'jetpack-ai-sidebar', 'woocommerce-ai' ],
			} )
		);
	} );

	it( 'forwards the provider client-state adapter to Agenttic', async () => {
		const clientStateDataPartAdapter = jest.fn( () => ( { quota: 'exhausted' } ) );
		const config = ( await createAgentConfig( {
			sessionId: 'session-1',
			clientStateDataPartAdapter,
		} ) ) as { clientStateDataPartAdapter?: typeof clientStateDataPartAdapter };

		expect( config.clientStateDataPartAdapter ).toBe( clientStateDataPartAdapter );
	} );

	it( 'uses the dedicated Jetpack endpoint for a server-metered editor site', async () => {
		setAgentsManagerData( { jetpackAiMeteringEnabled: true } );

		const config = await createAgentConfig( {
			sessionId: 'session-1',
			agentId: 'wp-orchestrator',
			environment: 'gutenberg',
		} );

		expect( config.agentUrl ).toBe( 'https://public-api.wordpress.com/wpcom/v2/ai/jetpack-agent' );
	} );

	it.each( [ 'reader-chat', 'p2-reader-chat' ] )(
		'keeps the shared endpoint for %s even with stale Jetpack metering data',
		async ( agentId ) => {
			setAgentsManagerData( { jetpackAiMeteringEnabled: true } );

			const config = await createAgentConfig( {
				sessionId: 'session-1',
				agentId,
				environment: 'reader-chat',
			} );

			expect( config.agentUrl ).toBe( 'https://public-api.wordpress.com/wpcom/v2/ai/agent' );
		}
	);

	it.each( [
		[ 'a non-editor surface', 'wp-admin', true ],
		[ 'an unmetered editor site', 'gutenberg', false ],
	] )( 'keeps the shared Agent endpoint for %s', async ( _label, environment, meteringEnabled ) => {
		setAgentsManagerData( { jetpackAiMeteringEnabled: meteringEnabled } );

		const config = await createAgentConfig( {
			sessionId: 'session-1',
			agentId: 'wp-orchestrator',
			environment,
		} );

		expect( config.agentUrl ).toBe( 'https://public-api.wordpress.com/wpcom/v2/ai/agent' );
	} );

	it( 'merges site editor actions into default client context', async () => {
		setSiteEditorAction( 'colorPickerItemSelected', 'Ruby' );

		const config = await createAgentConfig( {
			sessionId: 'session-1',
			sessionSiteKey: 'no-site',
			agentId: DOLLY_AGENT_ID,
		} );
		const context = config.contextProvider?.getClientContext();

		expect( context ).toEqual(
			expect.objectContaining( {
				siteEditorActions: {
					colorPickerItemSelected: 'Ruby',
				},
			} )
		);
	} );

	it( 'merges selected site, constructor args, and site editor actions into provider context', async () => {
		setSiteEditorAction( 'fontPickerItemSelected', 'Serif' );

		const config = await createAgentConfig( {
			sessionId: 'session-1',
			sessionSiteKey: 'no-site',
			siteId: 987,
			agentId: DOLLY_AGENT_ID,
			environment: 'site-editor',
			providerIds: [ 'jetpack-ai-sidebar', 'woocommerce-ai' ],
			contextProvider: {
				getClientContext: () => ( {
					url: 'https://example.com/wp-admin/site-editor.php',
					pathname: '/wp-admin/site-editor.php',
					search: '',
					environment: 'gutenberg',
					siteEditorActions: {
						colorPickerItemSelected: 'Ruby',
					},
					constructorArguments: {
						version: 'provider-version',
					},
				} ),
			},
		} );
		const context = config.contextProvider?.getClientContext();

		expect( context ).toEqual(
			expect.objectContaining( {
				selectedSiteId: 987,
				siteEditorActions: {
					colorPickerItemSelected: 'Ruby',
					fontPickerItemSelected: 'Serif',
				},
				loadedProviderIds: [ 'jetpack-ai-sidebar', 'woocommerce-ai' ],
				constructorArguments: {
					version: 'provider-version',
					client: 'site-editor',
				},
			} )
		);
	} );
} );
