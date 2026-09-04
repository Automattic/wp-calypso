import { store as abilitiesStore } from '@wordpress/abilities';
import { subscribe } from '@wordpress/data';
import { createWebMcpAdapter } from './adapter';
import { createRegistryToolProvider } from './registry-tool-provider';
import { createWebMcpToolProvider } from './server-ability-provider';
import type { ToolProvider } from '../extension-types';
import type { WebMcpAdapter, WebMcpModelContext } from './types';

type MountWebMcpToolsOptions = {
	getToolProvider: () => ToolProvider | undefined;
	modelContext: WebMcpModelContext;
	onSyncError: ( error: unknown ) => void;
};

/**
 * Wires the registry, the provider chain, and the REST bridge into one adapter
 * and keeps it in step with the `core/abilities` store, so abilities registered
 * by later effects or by other plugins appear without polling. The provider
 * chain lives outside that store, so the caller re-syncs when it changes.
 */
export function mountWebMcpTools( {
	getToolProvider,
	modelContext,
	onSyncError,
}: MountWebMcpToolsOptions ): WebMcpAdapter {
	const adapter = createWebMcpAdapter( {
		toolProvider: createWebMcpToolProvider( createRegistryToolProvider( getToolProvider ) ),
		modelContext,
	} );
	const sync = () => adapter.sync().catch( onSyncError );
	const unsubscribe = subscribe( sync, abilitiesStore );
	void sync();

	return {
		sync,
		dispose: () => {
			unsubscribe();
			adapter.dispose();
		},
	};
}
