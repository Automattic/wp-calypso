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
import { canConnectToZendesk } from '../can-connect-to-zendesk';
import { clearSiteEditorActions, setSiteEditorAction } from '../site-editor-context';
import { createCalypsoAuthProvider } from '../../auth/calypso-auth-provider';

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

		expect( mockCanConnectToZendesk ).toHaveBeenCalledTimes( 1 );
		expect( mockCreateCalypsoAuthProvider ).toHaveBeenCalledWith( undefined, {
			logWpcomJwtFailure: true,
		} );
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
			agentId: 'reader-chat',
		} );
		const context = config.contextProvider?.getClientContext();

		expect( context ).toEqual( expect.objectContaining( { selectedSiteId: 247750866 } ) );
	} );

	it( 'adds site editor constructor arguments from the host environment', async () => {
		const config = await createAgentConfig( {
			sessionId: 'session-1',
			agentId: 'dolly',
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
			agentId: 'dolly',
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

	it( 'merges site editor actions into default client context', async () => {
		setSiteEditorAction( 'colorPickerItemSelected', 'Ruby' );

		const config = await createAgentConfig( {
			sessionId: 'session-1',
			agentId: 'dolly',
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
			siteId: 987,
			agentId: 'dolly',
			environment: 'site-editor',
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
				constructorArguments: {
					version: 'provider-version',
					client: 'site-editor',
				},
			} )
		);
	} );
} );
