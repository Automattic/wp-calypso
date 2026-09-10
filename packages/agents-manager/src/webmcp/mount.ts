import { store as abilitiesStore } from '@wordpress/abilities';
import { subscribe } from '@wordpress/data';
import { createWebMcpAdapter } from './adapter';
import { mergeToolProviders } from './compose-tool-providers';
import { createRegistryToolProvider } from './registry-tool-provider';
import { createServerAbilityProvider } from './server-ability-provider';
import type { ToolProvider } from '../extension-types';
import type { WebMcpAdapter, WebMcpModelContext } from './types';

type MountWebMcpToolsOptions = {
	getToolProvider: () => ToolProvider | undefined;
	modelContext: WebMcpModelContext;
	onSyncError: ( error: unknown ) => void;
};

/**
 * Wires the three tool sources into one adapter and keeps it in step with the
 * `core/abilities` store, so abilities registered by later effects or by other
 * plugins appear without polling. The provider chain lives outside that store,
 * so the caller re-syncs when it changes.
 */
export function mountWebMcpTools( {
	getToolProvider,
	modelContext,
	onSyncError,
}: MountWebMcpToolsOptions ): WebMcpAdapter {
	const serverProvider = createServerAbilityProvider();
	const registryProvider = createRegistryToolProvider();
	const adapter = createWebMcpAdapter( {
		// Earlier sources win: a REST definition replaces a same-named copy from
		// the chain, and the chain keeps its own abilities ahead of the registry.
		// Exposure is decided on the winner, so a private definition also hides
		// its same-named fallbacks. A source that fails to load is reported and
		// skipped until the next sync.
		toolProvider: mergeToolProviders( () => {
			const toolProvider = getToolProvider();
			return toolProvider
				? [ serverProvider, toolProvider, registryProvider ]
				: [ serverProvider, registryProvider ];
		}, onSyncError ),
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
