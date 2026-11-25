import { useEffect } from '@wordpress/element';
import { canExposeWebMcpTools, getWebMcpModelContext } from '../webmcp/eligibility';
import type { ToolProvider } from '../extension-types';

export default function useWebMcpTools( {
	toolProvider,
	scope,
}: {
	toolProvider?: ToolProvider;
	scope: string;
} ): void {
	useEffect( () => {
		if ( ! toolProvider || ! canExposeWebMcpTools() ) {
			return;
		}

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
	}, [ scope, toolProvider ] );
}
