import { useEffect } from '@wordpress/element';
import { canExposeWebMcpTools, getWebMcpModelContext } from '../webmcp/eligibility';
import type { ToolProvider } from '../extension-types';

const RECONCILIATION_INTERVAL_MS = 2000;

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
		let interval: ReturnType< typeof setInterval > | undefined;
		let adapter: import('../webmcp/types').WebMcpAdapter | undefined;

		import( /* webpackChunkName: "am-webmcp" */ '../webmcp/adapter' )
			.then( ( { createWebMcpAdapter } ) => {
				if ( disposed ) {
					return;
				}

				adapter = createWebMcpAdapter( { toolProvider, modelContext } );
				adapter.sync().catch( ( error ) => {
					// eslint-disable-next-line no-console
					console.warn( '[AgentsManager] Failed to synchronize WebMCP tools:', error );
				} );

				interval = setInterval( () => {
					adapter?.sync().catch( ( error ) => {
						// eslint-disable-next-line no-console
						console.warn( '[AgentsManager] Failed to synchronize WebMCP tools:', error );
					} );
				}, RECONCILIATION_INTERVAL_MS );
			} )
			.catch( ( error ) => {
				// eslint-disable-next-line no-console
				console.warn( '[AgentsManager] Failed to load the WebMCP experiment:', error );
			} );

		return () => {
			disposed = true;
			if ( interval ) {
				clearInterval( interval );
			}
			adapter?.dispose();
		};
	}, [ scope, toolProvider ] );
}
