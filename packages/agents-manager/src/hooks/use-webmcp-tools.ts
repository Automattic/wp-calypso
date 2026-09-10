import { useEffect, useRef } from '@wordpress/element';
import { canExposeWebMcpTools, getWebMcpModelContext } from '../webmcp/eligibility';
import type { ToolProvider } from '../extension-types';
import type { WebMcpAdapter } from '../webmcp/types';

/**
 * Exposes the page's abilities as WebMCP tools while the experiment is
 * eligible. The runtime loads as its own chunk and follows the abilities
 * store. The provider chain arrives after the first render and lives outside
 * that store, so a provider change triggers one re-sync rather than a remount
 * that would drop and re-register every tool.
 */
export default function useWebMcpTools( {
	toolProvider,
	scope,
}: {
	toolProvider?: ToolProvider;
	scope: string;
} ): void {
	const toolProviderRef = useRef( toolProvider );
	toolProviderRef.current = toolProvider;
	const runtimeRef = useRef< WebMcpAdapter | undefined >( undefined );

	useEffect( () => {
		if ( ! canExposeWebMcpTools() ) {
			return;
		}

		const modelContext = getWebMcpModelContext();
		if ( ! modelContext ) {
			return;
		}

		let disposed = false;

		import( /* webpackChunkName: "am-webmcp" */ '../webmcp/mount' )
			.then( ( { mountWebMcpTools } ) => {
				if ( disposed ) {
					return;
				}

				runtimeRef.current = mountWebMcpTools( {
					getToolProvider: () => toolProviderRef.current,
					modelContext,
					onSyncError: ( error ) => {
						// eslint-disable-next-line no-console
						console.warn( '[AgentsManager] Failed to synchronize WebMCP tools:', error );
					},
				} );
			} )
			.catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.warn( '[AgentsManager] Failed to load the WebMCP experiment:', error );
			} );

		return () => {
			disposed = true;
			runtimeRef.current?.dispose();
			runtimeRef.current = undefined;
		};
	}, [ scope ] );

	useEffect( () => {
		void runtimeRef.current?.sync();
	}, [ toolProvider ] );
}
