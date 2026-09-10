import { normalizeAbilityName } from '../abilities/ability-name';
import {
	getWebMcpContract,
	getWebMcpDescription,
	getWebMcpInputSchema,
	normalizeInputSchema,
} from './contracts';
import {
	isWebMcpConsequential,
	selectExposedAbilities,
	shouldExposeWebMcpAbility,
} from './exposure';
import type { WebMcpToolProvider } from './compose-tool-providers';
import type {
	WebMcpAdapter,
	WebMcpExecutionContext,
	WebMcpModelContext,
	WebMcpTool,
} from './types';
import type { Ability } from '../abilities/types';

type Registration = {
	abortController: AbortController;
	fingerprint: string;
	toolName: string;
};

type CreateWebMcpAdapterOptions = {
	toolProvider: WebMcpToolProvider;
	modelContext: WebMcpModelContext;
};

function createAbortError(): Error {
	const error = new Error( 'WebMCP tool execution was aborted.' );
	error.name = 'AbortError';
	return error;
}

function getToolDescriptor( ability: Ability ): Omit< WebMcpTool, 'execute' > {
	const contract = getWebMcpContract( ability );
	const annotations = ability.meta?.annotations;

	return {
		name: normalizeAbilityName( ability.name ),
		title: ability.label || ability.name,
		description: getWebMcpDescription( ability ),
		inputSchema: normalizeInputSchema( getWebMcpInputSchema( ability ) ),
		// Only the three hints the WebMCP draft defines. The MCP-style
		// `destructiveHint` and `idempotentHint` are not part of it.
		annotations: {
			readOnlyHint: annotations?.readonly === true,
			// Site content, labels, and third-party abilities are user-authored.
			untrustedContentHint: true,
			// Lets a browser agent insist on user confirmation before running it.
			consequentialHint:
				contract.consequential === true ||
				isWebMcpConsequential( ability ) ||
				annotations?.destructive === true,
		},
	};
}

type ToolDescription = {
	descriptor: Omit< WebMcpTool, 'execute' >;
	fingerprint: string;
};

/**
 * A registry ability can carry a schema that cannot be serialized, such as a
 * cyclic object. That is a defect of that one ability, so it is reported and
 * skipped rather than allowed to abort the reconcile for the tools after it.
 */
function describeTool( ability: Ability ): ToolDescription | undefined {
	try {
		const descriptor = getToolDescriptor( ability );
		return { descriptor, fingerprint: JSON.stringify( descriptor ) };
	} catch {
		return undefined;
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

	// Resolve the definition and owner together: another lookup after validation
	// could switch to a recovered source with different exposure or hints.
	const createExecution =
		( ability: Ability, registration: Registration ): WebMcpTool[ 'execute' ] =>
		async ( input, options ) => {
			const { abortController, fingerprint, toolName } = registration;
			const isAborted = () => abortController.signal.aborted || options?.signal?.aborted;
			if ( isAborted() ) {
				throw createAbortError();
			}

			const resolved = await toolProvider.resolveAbility( ability.name );
			if (
				! resolved ||
				! shouldExposeWebMcpAbility( resolved.ability ) ||
				describeTool( resolved.ability )?.fingerprint !== fingerprint
			) {
				await sync().catch( () => {} );
				throw new Error(
					`WebMCP tool changed: ${ toolName }. Discover tools again before retrying.`
				);
			}
			if ( isAborted() ) {
				throw createAbortError();
			}

			const contract = getWebMcpContract( resolved.ability );
			const rawInput = input ?? {};
			const preparedInput = contract.prepareInput
				? contract.prepareInput( rawInput, context )
				: rawInput;
			const result = await resolved.provider.executeAbility( resolved.ability.name, preparedInput );
			contract.afterExecute?.( result, context );

			return contract.adaptResult ? contract.adaptResult( result ) : result;
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
			if ( disposed ) {
				break;
			}

			const current = registrations.get( abilityName );
			const described = describeTool( ability );
			if ( ! described ) {
				failure ??= {
					error: new Error( `The WebMCP descriptor of ${ ability.name } cannot be serialized.` ),
				};
				if ( current ) {
					await unregister( current );
					registrations.delete( abilityName );
				}
				continue;
			}

			const { descriptor, fingerprint } = described;
			if ( current?.fingerprint === fingerprint ) {
				continue;
			}

			if ( current ) {
				await unregister( current );
				registrations.delete( abilityName );
			}
			if ( disposed ) {
				break;
			}

			const abortController = new AbortController();
			const registration: Registration = {
				abortController,
				fingerprint,
				toolName: descriptor.name,
			};
			pendingControllers.add( abortController );

			try {
				await modelContext.registerTool(
					{ ...descriptor, execute: createExecution( ability, registration ) },
					{ signal: abortController.signal }
				);
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

			registrations.set( abilityName, registration );
		}

		if ( failure ) {
			throw failure.error;
		}
	};

	function sync(): Promise< void > {
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
	}

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
