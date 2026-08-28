import { useEffect, useState } from '@wordpress/element';
import { isEditorPage } from '../utils/is-editor-page';
import { getWebMcpModelContext, isWebMcpExperimentEnabled } from '../webmcp/eligibility';
import type { ToolProvider } from '../extension-types';
import type { WebMcpModelContext } from '../webmcp/types';

const RECONCILIATION_INTERVAL_MS = 2000;

export default function useWebMcpTools( {
	toolProvider,
	scope,
}: {
	toolProvider?: ToolProvider;
	scope: string;
} ): boolean {
	const isEligible = isWebMcpExperimentEnabled() && isEditorPage();
	const [ modelContext, setModelContext ] = useState< WebMcpModelContext | undefined >( () =>
		isEligible ? getWebMcpModelContext() : undefined
	);
	const activeModelContext = isEligible ? modelContext : undefined;

	useEffect( () => {
		if ( ! isEligible ) {
			return;
		}

		const interval = setInterval( () => {
			const nextModelContext = getWebMcpModelContext();
			setModelContext( ( currentModelContext ) =>
				currentModelContext === nextModelContext ? currentModelContext : nextModelContext
			);
		}, RECONCILIATION_INTERVAL_MS );

		return () => clearInterval( interval );
	}, [ isEligible, scope ] );

	useEffect( () => {
		if ( ! toolProvider || ! activeModelContext ) {
			return;
		}

		let disposed = false;
		let interval: ReturnType< typeof setInterval > | undefined;
		let adapter: import('../webmcp/types').WebMcpAdapter | undefined;

		import( /* webpackChunkName: "am-webmcp" */ '../webmcp/adapter' )
			.then( ( { createWebMcpAdapter, createWebMcpToolProvider } ) => {
				if ( disposed ) {
					return;
				}

				adapter = createWebMcpAdapter( {
					toolProvider: createWebMcpToolProvider( toolProvider ),
					modelContext: activeModelContext,
				} );
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
	}, [ activeModelContext, scope, toolProvider ] );

	return !! activeModelContext;
}
