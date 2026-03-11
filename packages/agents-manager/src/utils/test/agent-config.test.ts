import { ORCHESTRATOR_AGENT_ID } from '../../constants';
import { createAgentConfig, getAgentConfig } from '../agent-config';
import type { ContextProvider } from '../../extension-types';

describe( 'agent-config', () => {
	beforeEach( () => {
		window.history.replaceState( {}, '', '/' );
	} );

	describe( 'getAgentConfig', () => {
		it( 'returns defaults when no overrides are provided', () => {
			expect( getAgentConfig() ).toEqual( {
				agentId: ORCHESTRATOR_AGENT_ID,
				version: undefined,
				botSlug: undefined,
			} );
		} );

		it( 'uses query params when explicit overrides are not provided', () => {
			window.history.replaceState( {}, '', '/?agent=workflow&version=1.0.1&slug=slug-a' );

			expect( getAgentConfig() ).toEqual( {
				agentId: 'workflow',
				version: '1.0.1',
				botSlug: 'slug-a',
			} );
		} );

		it( 'accepts `bot` alias for bot slug query param', () => {
			window.history.replaceState( {}, '', '/?agent=workflow&bot=slug-b' );

			expect( getAgentConfig() ).toEqual( {
				agentId: 'workflow',
				version: undefined,
				botSlug: 'slug-b',
			} );
		} );

		it( 'prioritizes explicit overrides over query params', () => {
			window.history.replaceState( {}, '', '/?agent=wp-orchestrator&version=old&slug=old-slug' );

			expect(
				getAgentConfig( {
					agentId: 'workflow',
					version: '2.0.0',
					botSlug: 'new-slug',
				} )
			).toEqual( {
				agentId: 'workflow',
				version: '2.0.0',
				botSlug: 'new-slug',
			} );
		} );
	} );

	describe( 'createAgentConfig', () => {
		it( 'adds bot slug to constructorArguments for default context provider', () => {
			const config = createAgentConfig( {
				sessionId: 'session-1',
				agentId: 'workflow',
				botSlug: 'workflow-bot',
			} );

			expect( config.contextProvider?.getClientContext().constructorArguments ).toEqual( {
				slug: 'workflow-bot',
			} );
		} );

		it( 'merges version and bot slug with existing constructor arguments', () => {
			const contextProvider: ContextProvider = {
				getClientContext: () => ( {
					url: 'https://example.com',
					pathname: '/wp-admin',
					search: '',
					environment: 'wp-admin',
					constructorArguments: { existing: 'value' },
				} ),
			};

			const config = createAgentConfig( {
				sessionId: 'session-2',
				agentId: 'workflow',
				version: '1.2.3',
				botSlug: 'workflow-bot',
				contextProvider,
			} );

			expect( config.contextProvider?.getClientContext().constructorArguments ).toEqual( {
				existing: 'value',
				version: '1.2.3',
				slug: 'workflow-bot',
			} );
		} );
	} );
} );
