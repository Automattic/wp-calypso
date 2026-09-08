import { normalizeAbilityName } from '../abilities/ability-name';
import {
	getWebMcpContract,
	getWebMcpDescription,
	getWebMcpInputSchema,
	normalizeInputSchema,
} from './contracts';
import { selectExposedAbilities } from './exposure';
import type { Ability } from '../abilities/types';
import type { ToolProvider } from '../extension-types';
import type {
	WebMcpAdapter,
	WebMcpExecutionContext,
	WebMcpModelContext,
	WebMcpTool,
} from './types';

type Registration = {
	abortController: AbortController;
	fingerprint: string;
	toolName: string;
};

type CreateWebMcpAdapterOptions = {
	toolProvider: ToolProvider;
	modelContext: WebMcpModelContext;
};

function createAbortError(): Error {
	const error = new Error( 'WebMCP tool execution was aborted.' );
	error.name = 'AbortError';
	return error;
}

function createTool(
	ability: Ability,
	toolProvider: ToolProvider,
	context: WebMcpExecutionContext
): WebMcpTool {
	const contract = getWebMcpContract( ability );
	const annotations = ability.meta?.annotations;

	return {
		name: normalizeAbilityName( ability.name ),
		title: ability.label || ability.name,
		description: getWebMcpDescription( ability ),
		inputSchema: normalizeInputSchema( getWebMcpInputSchema( ability ) ),
		annotations: {
			readOnlyHint: annotations?.readonly === true,
			destructiveHint: contract.destructive === true || annotations?.destructive === true,
			idempotentHint: annotations?.idempotent === true,
			// Site content, labels, and third-party abilities are user-authored.
			untrustedContentHint: true,
		},
		execute: async ( input, options ) => {
			if ( options?.signal?.aborted ) {
				throw createAbortError();
			}

			const rawInput = input ?? {};
			const preparedInput = contract.prepareInput
				? contract.prepareInput( rawInput, context )
				: rawInput;
			const result = await toolProvider.executeAbility( ability.name, preparedInput );
			contract.afterExecute?.( result, context );

			return contract.adaptResult ? contract.adaptResult( result ) : result;
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
}: CreateWebMcpAdapterOptions ): WebMcpAdapter {
	const registrations = new Map< string, Registration >();
	const pendingControllers = new Set< AbortController >();
	const context: WebMcpExecutionContext = { knownBlockClientIds: new Set() };
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

	// Warned once per collision, and again only if it goes away and comes back.
	const reportCollisions = ( collisions: Map< string, Ability[] > ) => {
		for ( const toolName of reportedCollisions ) {
			if ( ! collisions.has( toolName ) ) {
				reportedCollisions.delete( toolName );
			}
		}

		for ( const [ toolName, candidates ] of collisions ) {
			if ( reportedCollisions.has( toolName ) ) {
				continue;
			}

			reportedCollisions.add( toolName );
			// eslint-disable-next-line no-console
			console.warn(
				`[AgentsManager] WebMCP tool name "${ toolName }" is claimed by several abilities (${ candidates
					.map( ( candidate ) => candidate.name )
					.join( ', ' ) }). None of them are exposed.`
			);
		}
	};

	const reconcile = async () => {
		const abilities = await toolProvider.getAbilities();
		if ( disposed ) {
			return;
		}

		const { exposed, collisions } = selectExposedAbilities( abilities );
		reportCollisions( collisions );

		for ( const [ abilityName, registration ] of registrations ) {
			if ( ! exposed.has( abilityName ) ) {
				await unregister( registration );
				registrations.delete( abilityName );
			}
		}

		// One rejected registration must not block the tools after it. The
		// first failure is rethrown once every candidate has been attempted;
		// the failed ones stay unregistered, so the next sync retries them.
		let failure: { error: unknown } | undefined;

		for ( const [ abilityName, ability ] of exposed ) {
			const tool = createTool( ability, toolProvider, context );
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
			context.knownBlockClientIds.clear();
		},
	};
}
