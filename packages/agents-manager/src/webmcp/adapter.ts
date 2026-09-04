import { parse } from '@wordpress/blocks';
import { normalizeAbilityName } from '../abilities/ability-name';
import {
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	GET_BLOCK_TREE_ABILITY_NAME,
	SHOW_TEMPLATE_ABILITY_NAME,
	getWebMcpDescription,
	getWebMcpInputSchema,
} from './contracts';
import { shouldExposeWebMcpAbility } from './exposure';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';
import type { WebMcpAdapter, WebMcpModelContext, WebMcpTool } from './types';
import type { Block } from '@wordpress/blocks';

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

type ExecutionContext = {
	knownBlockClientIds: Set< string >;
};

function isRecord( value: unknown ): value is Record< string, unknown > {
	return !! value && typeof value === 'object' && ! Array.isArray( value );
}

function rememberBlockClientIds( result: unknown, context: ExecutionContext ): void {
	if (
		! isRecord( result ) ||
		! isRecord( result.result ) ||
		! isRecord( result.result.details )
	) {
		return;
	}

	const visit = ( blocks: unknown ) => {
		if ( ! Array.isArray( blocks ) ) {
			return;
		}

		for ( const block of blocks ) {
			if ( ! isRecord( block ) ) {
				continue;
			}

			if ( typeof block.clientId === 'string' ) {
				context.knownBlockClientIds.add( block.clientId );
			}
			visit( block.innerBlocks );
		}
	};

	context.knownBlockClientIds.clear();
	visit( result.result.details.blocks );
}

function prepareApplyBlockEditsInput(
	input: Record< string, unknown >,
	context: ExecutionContext
): Record< string, unknown > {
	const toBlockData = ( block: Block ): Record< string, unknown > => ( {
		name: block.name,
		attributes: block.attributes,
		...( block.innerBlocks.length ? { innerBlocks: block.innerBlocks.map( toBlockData ) } : {} ),
	} );
	const inserts = Array.isArray( input.inserts )
		? input.inserts.flatMap( ( insert ) => {
				if ( ! isRecord( insert ) || typeof insert.blockMarkup !== 'string' ) {
					return [ insert ];
				}

				const blocks = parse( insert.blockMarkup );
				if ( blocks.length === 0 ) {
					throw new Error( 'The supplied blockMarkup did not contain any Gutenberg blocks.' );
				}

				const { blockMarkup: _blockMarkup, block: _block, ...placement } = insert;
				return blocks.map( ( block, offset ) => ( {
					...placement,
					...( typeof placement.index === 'number' ? { index: placement.index + offset } : {} ),
					block: toBlockData( block ),
				} ) );
		  } )
		: undefined;
	const reverseMap = Object.fromEntries(
		Array.from( context.knownBlockClientIds, ( clientId ) => [ clientId, clientId ] )
	);

	return {
		...( Array.isArray( input.updates ) ? { updates: input.updates } : {} ),
		...( inserts ? { inserts } : {} ),
		...( Array.isArray( input.deletes ) ? { deletes: input.deletes } : {} ),
		...( typeof input.summary === 'string' ? { summary: input.summary } : {} ),
		reverseMap,
		suppressAssistantMessage: true,
	};
}

function adaptResultForWebMcp( abilityName: string, value: unknown ): unknown {
	if ( abilityName !== SHOW_TEMPLATE_ABILITY_NAME ) {
		return value;
	}

	if ( typeof value === 'string' ) {
		return value.replaceAll( 'big_sky__get_page_structure', 'agents_manager__get_block_tree' );
	}

	if ( Array.isArray( value ) ) {
		return value.map( ( item ) => adaptResultForWebMcp( abilityName, item ) );
	}

	if ( isRecord( value ) ) {
		return Object.fromEntries(
			Object.entries( value ).map( ( [ key, item ] ) => [
				key,
				adaptResultForWebMcp( abilityName, item ),
			] )
		);
	}

	return value;
}

function createTool(
	ability: Ability,
	toolProvider: ToolProvider,
	executionContext: ExecutionContext
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
			// Site content, labels, and third-party abilities are user-authored.
			untrustedContentHint: true,
		},
		execute: async ( input, options ) => {
			if ( options?.signal?.aborted ) {
				throw createAbortError();
			}

			const preparedInput =
				ability.name === APPLY_BLOCK_EDITS_ABILITY_NAME
					? prepareApplyBlockEditsInput( input ?? {}, executionContext )
					: input ?? {};
			const result = await toolProvider.executeAbility( ability.name, preparedInput );

			if ( ability.name === GET_BLOCK_TREE_ABILITY_NAME ) {
				rememberBlockClientIds( result, executionContext );
			}

			return adaptResultForWebMcp( ability.name, result );
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

/**
 * Dictionary conversion normally ignores unknown members, but polyfills and
 * older builds have validated the descriptor strictly. A TypeError on the
 * first attempt is retried once with only the members every version knows.
 */
async function registerTool(
	modelContext: WebMcpModelContext,
	tool: WebMcpTool,
	signal: AbortSignal
): Promise< void > {
	try {
		await modelContext.registerTool( tool, { signal } );
	} catch ( error ) {
		if ( ! ( error instanceof TypeError ) ) {
			throw error;
		}

		const { title: _title, annotations, ...essentials } = tool;
		await modelContext.registerTool(
			{ ...essentials, annotations: { readOnlyHint: annotations.readOnlyHint } },
			{ signal }
		);
	}
}

export function createWebMcpAdapter( {
	toolProvider,
	modelContext,
	shouldExposeAbility = shouldExposeWebMcpAbility,
}: CreateWebMcpAdapterOptions ): WebMcpAdapter {
	const registrations = new Map< string, Registration >();
	const pendingControllers = new Set< AbortController >();
	const executionContext: ExecutionContext = { knownBlockClientIds: new Set() };
	const reportedCollisions = new Set< string >();
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

	// The `/` to `__` and `-` to `_` mapping is not injective: a doubled dash
	// and a segment boundary both land on `__`. Two abilities on one tool name
	// would silently overwrite each other, so neither is exposed.
	const collectEligible = ( abilities: Ability[] ): Map< string, Ability > => {
		const abilitiesByToolName = new Map< string, Ability[] >();
		for ( const ability of abilities ) {
			if ( ! shouldExposeAbility( ability ) ) {
				continue;
			}

			const toolName = normalizeAbilityName( ability.name );
			abilitiesByToolName.set( toolName, [
				...( abilitiesByToolName.get( toolName ) ?? [] ),
				ability,
			] );
		}

		const eligible = new Map< string, Ability >();
		for ( const [ toolName, candidates ] of abilitiesByToolName ) {
			if ( candidates.length === 1 ) {
				reportedCollisions.delete( toolName );
				eligible.set( candidates[ 0 ].name, candidates[ 0 ] );
				continue;
			}

			if ( ! reportedCollisions.has( toolName ) ) {
				reportedCollisions.add( toolName );
				// eslint-disable-next-line no-console
				console.warn(
					`[AgentsManager] WebMCP tool name "${ toolName }" is claimed by several abilities (${ candidates
						.map( ( candidate ) => candidate.name )
						.join( ', ' ) }). None of them are exposed.`
				);
			}
		}

		return eligible;
	};

	const reconcile = async () => {
		const abilities = await toolProvider.getAbilities();
		if ( disposed ) {
			return;
		}

		const eligible = collectEligible( abilities );

		for ( const [ abilityName, registration ] of registrations ) {
			if ( ! eligible.has( abilityName ) ) {
				await unregister( registration );
				registrations.delete( abilityName );
			}
		}

		// One rejected registration must not block the tools after it. The
		// first failure is rethrown once every candidate has been attempted;
		// the failed ones stay unregistered, so the next sync retries them.
		let failure: { error: unknown } | undefined;

		for ( const [ abilityName, ability ] of eligible ) {
			const tool = createTool( ability, toolProvider, executionContext );
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
				await registerTool( modelContext, tool, abortController.signal );
			} catch ( error ) {
				abortController.abort();
				failure ??= { error };
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

		if ( failure ) {
			throw failure.error;
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
			executionContext.knownBlockClientIds.clear();
		},
	};
}
