import { parse } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { normalizeAbilityName } from '../abilities/ability-name';
import { isRecord } from '../utils/is-record';
import {
	APPLY_BLOCK_EDITS_ABILITY_NAME,
	EDIT_ENTITY_RECORD_ABILITY_NAME,
	GET_BLOCK_TREE_ABILITY_NAME,
	SHOW_TEMPLATE_ABILITY_NAME,
	getWebMcpDescription,
	getWebMcpInputSchema,
	isWebMcpServerAbilityName,
} from './contracts';
import type { ToolProvider } from '../extension-types';
import type { WebMcpAdapter, WebMcpModelContext, WebMcpTool } from './types';
import type { Ability } from '@wordpress/abilities';
import type { Block } from '@wordpress/blocks';

export { withoutChatToolCalls } from './non-chat-call-provider';
export { subscribeToRegistryAbilities, withRegistryAbilities } from './registry-ability-provider';
export { createWebMcpToolProvider } from './server-ability-provider';

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

const EDITABLE_POST_TYPES = [ 'post', 'page' ];
const EDITABLE_POST_FIELDS = [ 'title', 'excerpt' ];

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

type ExecutionContext = {
	knownBlockClientIds: Set< string >;
};

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
	};
}

/**
 * Targets the open post, so the WebMCP tool can never reach the full ability's
 * creates, deletes and site-wide edits.
 */
function prepareEditEntityRecordInput(
	input: Record< string, unknown >
): Record< string, unknown > {
	const editor = select( 'core/editor' ) as
		| {
				getCurrentPostType?: () => string | undefined;
				getCurrentPostId?: () => number | string | undefined;
		  }
		| undefined;
	const postType = editor?.getCurrentPostType?.();
	const postId = editor?.getCurrentPostId?.();

	if ( ! postType || ! EDITABLE_POST_TYPES.includes( postType ) || postId == null ) {
		throw new Error( 'The editor does not have a post or page open.' );
	}

	const unknownFields = Object.keys( input ).filter(
		( key ) => ! EDITABLE_POST_FIELDS.includes( key )
	);

	if ( unknownFields.length ) {
		throw new Error(
			`Unknown field: ${ unknownFields.join( ', ' ) }. Use title and excerpt only.`
		);
	}

	const record = Object.fromEntries(
		Object.entries( input ).filter( ( [ , value ] ) => typeof value === 'string' )
	);

	if ( Object.keys( record ).length !== Object.keys( input ).length ) {
		throw new Error( 'title and excerpt must be strings.' );
	}

	if ( ! Object.keys( record ).length ) {
		throw new Error( 'Provide a title or an excerpt.' );
	}

	return {
		editEntities: [ { entityType: 'postType', entityName: postType, recordId: postId, record } ],
	};
}

function prepareInput(
	abilityName: string,
	input: Record< string, unknown >,
	context: ExecutionContext
): Record< string, unknown > {
	if ( abilityName === APPLY_BLOCK_EDITS_ABILITY_NAME ) {
		return prepareApplyBlockEditsInput( input, context );
	}

	if ( abilityName === EDIT_ENTITY_RECORD_ABILITY_NAME ) {
		return prepareEditEntityRecordInput( input );
	}

	return input;
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
	shouldExposeAbility: ( ability: Ability ) => boolean,
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

			const preparedInput = prepareInput( ability.name, input ?? {}, executionContext );
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

export function createWebMcpAdapter( {
	toolProvider,
	modelContext,
	shouldExposeAbility = shouldExposeWebMcpAbility,
}: CreateWebMcpAdapterOptions ): WebMcpAdapter {
	const registrations = new Map< string, Registration >();
	const pendingControllers = new Set< AbortController >();
	const executionContext: ExecutionContext = { knownBlockClientIds: new Set() };
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
			const tool = createTool( ability, toolProvider, shouldExposeAbility, executionContext );
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
			executionContext.knownBlockClientIds.clear();
		},
	};
}
