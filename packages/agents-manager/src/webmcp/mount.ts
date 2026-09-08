import { store as abilitiesStore } from '@wordpress/abilities';
import { subscribe } from '@wordpress/data';
import { createWebMcpAdapter } from './adapter';
import { createRegistryToolProvider } from './registry-tool-provider';
import { createServerAbilityProvider } from './server-ability-provider';
import type { ToolProvider } from '../extension-types';
import type { WebMcpAdapter, WebMcpModelContext } from './types';

const RETRY_DELAYS_MS = [ 1000, 2000, 4000 ];

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
		getToolProviders: () => {
			const provider = getToolProvider();
			return provider
				? [ serverProvider, provider, registryProvider ]
				: [ serverProvider, registryProvider ];
		},
		modelContext,
	} );
	let disposed = false;
	let retryCount = 0;
	let retryTimer: ReturnType< typeof setTimeout > | undefined;
	const cancelRetry = () => {
		clearTimeout( retryTimer );
		retryTimer = undefined;
	};
	const sync = async () => {
		if ( disposed ) {
			return;
		}
		cancelRetry();
		try {
			await adapter.sync();
			cancelRetry();
			retryCount = 0;
		} catch ( error ) {
			if ( disposed ) {
				return;
			}
			onSyncError( error );
			if ( retryTimer === undefined && retryCount < RETRY_DELAYS_MS.length ) {
				retryTimer = setTimeout( () => {
					retryTimer = undefined;
					void sync();
				}, RETRY_DELAYS_MS[ retryCount++ ] );
			}
		}
	};
	const unsubscribe = subscribe( sync, abilitiesStore );
	void sync();

	return {
		sync,
		dispose: () => {
			disposed = true;
			cancelRetry();
			unsubscribe();
			adapter.dispose();
		},
	};
}
