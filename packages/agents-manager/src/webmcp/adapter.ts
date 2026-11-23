import { normalizeAbilityName } from '../abilities/ability-name';
import {
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	GET_BLOCK_TREE_ABILITY_NAME,
	getWebMcpDescription,
	getWebMcpInputSchema,
	isWebMcpServerAbilityName,
} from './contracts';
import { adaptToolResult, prepareToolInput, rememberBlockClientIds } from './tool-calls';
import type { ToolProvider } from '../extension-types';
import type { ToolCallContext } from './tool-calls';
import type { WebMcpAdapter, WebMcpModelContext, WebMcpTool } from './types';
import type { Ability } from '@wordpress/abilities';

export { withoutChatToolCalls } from './non-chat-call-provider';
export { subscribeToRegistryAbilities, withRegistryAbilities } from './registry-ability-provider';
export { withServerAbilities } from './server-ability-provider';

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

export function shouldExposeWebMcpAbility( ability: Ability ): boolean {
	const annotations = ability.meta?.annotations;

	if ( isWebMcpServerAbilityName( ability.name ) ) {
		return annotations?.serverRegistered === true && annotations.readonly === true;
	}

	if ( ability.meta?.webmcp?.public !== true || annotations?.serverRegistered === true ) {
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

function createTool(
	ability: Ability,
	toolProvider: ToolProvider,
	shouldExposeAbility: ( ability: Ability ) => boolean,
	toolCallContext: ToolCallContext
): WebMcpTool {
	return {
		name: normalizeAbilityName( ability.name ),
		title: ability.label || ability.name,
		description: getWebMcpDescription( ability ),
		inputSchema: normalizeInputSchema( getWebMcpInputSchema( ability ) ),
		annotations: {
			readOnlyHint: ability.meta?.annotations?.readonly === true,
			destructiveHint:
				ability.name === APPLY_BLOCK_EDITS_ABILITY_NAME ||
				ability.meta?.annotations?.destructive === true,
			idempotentHint: ability.meta?.annotations?.idempotent === true,
		},
		execute: async ( input, options ) => {
			// The ability can change before the next sync replaces this tool, e.g. an unflagged one
			// registered under the same name.
			const current = ( await toolProvider.getAbilities() ).find(
				( item ) => item.name === ability.name
			);

			// Checked after the lookup, so a call cancelled while it was pending never edits.
			if ( options?.signal?.aborted ) {
				throw createAbortError();
			}

			if ( ! current || ! shouldExposeAbility( current ) ) {
				throw new Error(
					`WebMCP tool is no longer available: ${ normalizeAbilityName( ability.name ) }`
				);
			}

			const preparedInput = prepareToolInput( ability.name, input ?? {}, toolCallContext );
			const result = await toolProvider.executeAbility( ability.name, preparedInput );

			if ( ability.name === GET_BLOCK_TREE_ABILITY_NAME ) {
				rememberBlockClientIds( result, toolCallContext );
			}

			return adaptToolResult( ability.name, result );
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
	const toolCallContext: ToolCallContext = { knownBlockClientIds: new Set() };
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
		const registrationErrors: unknown[] = [];

		for ( const [ abilityName, registration ] of registrations ) {
			if ( ! eligible.has( abilityName ) ) {
				await unregister( registration );
				registrations.delete( abilityName );
			}
		}

		for ( const [ abilityName, ability ] of eligible ) {
			const tool = createTool( ability, toolProvider, shouldExposeAbility, toolCallContext );
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
				// One rejected tool, such as a plugin's invalid schema, must not hide the others.
				abortController.abort();
				registrationErrors.push( error );
				continue;
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

		if ( registrationErrors.length ) {
			throw registrationErrors[ 0 ];
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
			toolCallContext.knownBlockClientIds.clear();
		},
	};
}
