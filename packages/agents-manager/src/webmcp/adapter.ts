import { normalizeAbilityName } from '../abilities/ability-name';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';
import type { WebMcpAdapter, WebMcpModelContext, WebMcpTool } from './types';

type Registration = {
	abortController: AbortController;
	fingerprint: string;
	toolName: string;
};

type CreateWebMcpAdapterOptions = {
	toolProvider: ToolProvider;
	modelContext: WebMcpModelContext;
	shouldExposeAbility?: ( ability: Ability ) => boolean;
};

/**
 * The initial experiment exposes only this client-side editor mutation. It edits
 * the current canvas without saving or publishing, and execution remains behind
 * the merged provider's permission checks and canvas guard.
 */
export const WEBMCP_EDITOR_ABILITY_ALLOWLIST = new Set( [ 'big-sky/apply-block-edits' ] );

export function shouldExposeWebMcpAbility( ability: Ability ): boolean {
	if ( ! WEBMCP_EDITOR_ABILITY_ALLOWLIST.has( ability.name ) ) {
		return false;
	}

	const annotations = ability.meta?.annotations;
	if ( annotations?.serverRegistered === true ) {
		return false;
	}

	return annotations?.clientRegistered === true || typeof ability.callback === 'function';
}

export function normalizeInputSchema( schema: unknown ): Record< string, unknown > {
	if ( ! schema || typeof schema !== 'object' || Array.isArray( schema ) ) {
		return { type: 'object', properties: {} };
	}

	const normalized = schema as Record< string, unknown >;
	if ( ! ( 'type' in normalized ) && ! ( 'anyOf' in normalized ) && ! ( 'oneOf' in normalized ) ) {
		return { ...normalized, type: 'object' };
	}

	return normalized;
}

function createAbortError(): Error {
	const error = new Error( 'WebMCP tool execution was aborted.' );
	error.name = 'AbortError';
	return error;
}

function createTool( ability: Ability, toolProvider: ToolProvider ): WebMcpTool {
	return {
		name: normalizeAbilityName( ability.name ),
		title: ability.label || ability.name,
		description: ability.description || ability.label || ability.name,
		inputSchema: normalizeInputSchema( ability.input_schema ),
		annotations: {
			readOnlyHint: ability.meta?.annotations?.readonly === true,
		},
		execute: async ( input, options ) => {
			if ( options?.signal?.aborted ) {
				throw createAbortError();
			}

			return toolProvider.executeAbility( ability.name, input ?? {} );
		},
	};
}

function fingerprintTool( tool: WebMcpTool ): string {
	return JSON.stringify( {
		name: tool.name,
		title: tool.title,
		description: tool.description,
		inputSchema: tool.inputSchema,
		annotations: tool.annotations,
	} );
}

export function createWebMcpAdapter( {
	toolProvider,
	modelContext,
	shouldExposeAbility = shouldExposeWebMcpAbility,
}: CreateWebMcpAdapterOptions ): WebMcpAdapter {
	const registrations = new Map< string, Registration >();
	const pendingControllers = new Set< AbortController >();
	let disposed = false;
	let syncRequested = false;
	let syncQueue = Promise.resolve();

	const unregister = async ( registration: Registration ): Promise< void > => {
		registration.abortController.abort();

		if ( modelContext.unregisterTool ) {
			try {
				await modelContext.unregisterTool( registration.toolName );
			} catch {
				// Aborting the registration signal may already have removed the tool.
			}
		}
	};

	const reconcile = async () => {
		const abilities = await toolProvider.getAbilities();
		if ( disposed ) {
			return;
		}

		const eligible = new Map(
			abilities
				.filter( shouldExposeAbility )
				.map( ( ability ) => [ ability.name, ability ] as const )
		);

		for ( const [ abilityName, registration ] of registrations ) {
			if ( ! eligible.has( abilityName ) ) {
				await unregister( registration );
				registrations.delete( abilityName );
			}
		}

		for ( const [ abilityName, ability ] of eligible ) {
			const tool = createTool( ability, toolProvider );
			const fingerprint = fingerprintTool( tool );
			const current = registrations.get( abilityName );

			if ( current?.fingerprint === fingerprint ) {
				continue;
			}

			if ( current ) {
				await unregister( current );
				registrations.delete( abilityName );
			}

			const abortController = new AbortController();
			pendingControllers.add( abortController );

			try {
				await modelContext.registerTool( tool, { signal: abortController.signal } );
			} catch ( error ) {
				abortController.abort();
				throw error;
			} finally {
				pendingControllers.delete( abortController );
			}

			if ( disposed ) {
				abortController.abort();
				continue;
			}

			registrations.set( abilityName, {
				abortController,
				fingerprint,
				toolName: tool.name,
			} );
		}
	};

	const sync = (): Promise< void > => {
		if ( disposed ) {
			return Promise.resolve();
		}

		syncRequested = true;
		const result = syncQueue.then( async () => {
			while ( syncRequested && ! disposed ) {
				syncRequested = false;
				await reconcile();
			}
		} );

		syncQueue = result.catch( () => {} );
		return result;
	};

	return {
		sync,
		dispose: () => {
			disposed = true;
			syncRequested = false;

			for ( const controller of pendingControllers ) {
				controller.abort();
			}
			pendingControllers.clear();

			for ( const registration of registrations.values() ) {
				void unregister( registration );
			}
			registrations.clear();
		},
	};
}
