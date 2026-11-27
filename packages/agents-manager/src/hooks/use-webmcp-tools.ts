import { useEffect } from '@wordpress/element';
import { canExposeWebMcpTools, getWebMcpModelContext } from '../webmcp/eligibility';
import type { ToolProvider } from '../extension-types';
import type { LoadedProviders } from '../utils/load-external-providers';

// A site with no agent provider still offers the flagged abilities in the `@wordpress/abilities`
// registry.
const NO_TOOL_PROVIDER: ToolProvider = {
	getAbilities: async () => [],
	executeAbility: async ( name ) => {
		throw new Error( `No tool provider runs ${ name }` );
	},
};

export default function useWebMcpTools( {
	providers,
	scope,
}: {
	providers: Pick< LoadedProviders, 'toolProvider' > | null;
	scope: string;
} ): void {
	useEffect( () => {
		if ( ! providers || ! canExposeWebMcpTools() ) {
			return;
		}

		const toolProvider = providers.toolProvider ?? NO_TOOL_PROVIDER;

		const modelContext = getWebMcpModelContext();

		if ( ! modelContext ) {
			return;
		}

		let disposed = false;
		let unsubscribe: ( () => void ) | undefined;
		let adapter: import( '../webmcp/types' ).WebMcpAdapter | undefined;

		import( /* webpackChunkName: "am-webmcp" */ '../webmcp/adapter' )
			.then(
				( {
					createWebMcpAdapter,
					subscribeToRegistryAbilities,
					withBlockEditCorrections,
					withRegistryAbilities,
					withServerAbilities,
					withoutChatToolCalls,
				} ) => {
					if ( disposed ) {
						return;
					}

					adapter = createWebMcpAdapter( {
						toolProvider: withServerAbilities(
							withBlockEditCorrections(
								withRegistryAbilities( withoutChatToolCalls( toolProvider ) )
							)
						),
						modelContext,
					} );

					const sync = () => {
						adapter?.sync().catch( ( error ) => {
							// eslint-disable-next-line no-console
							console.warn( '[AgentsManager] Failed to synchronize WebMCP tools:', error );
						} );
					};

					sync();
					unsubscribe = subscribeToRegistryAbilities( sync );
				}
			)
			.catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.warn( '[AgentsManager] Failed to load the WebMCP experiment:', error );
			} );

		return () => {
			disposed = true;
			unsubscribe?.();
			adapter?.dispose();
		};
	}, [ scope, providers ] );
}
