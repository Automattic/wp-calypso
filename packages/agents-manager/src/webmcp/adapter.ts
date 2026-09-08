import { findAbilityByName, normalizeAbilityName } from '../abilities/ability-name';
import { collectToolProviderAbilities } from '../utils/compose-tool-providers';
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
	provider: ToolProvider;
	toolName: string;
};

type CreateWebMcpAdapterOptions = {
	getToolProviders: () => ToolProvider[];
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

export function createWebMcpAdapter( {
	getToolProviders,
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

	const createExecution =
		( ability: Ability, registration: Registration ): WebMcpTool[ 'execute' ] =>
		async ( input, options ) => {
			const { provider, fingerprint, abortController, toolName } = registration;
			const isAborted = () => abortController.signal.aborted || options?.signal?.aborted;
			if ( isAborted() ) {
				throw createAbortError();
			}
			const liveAbility = findAbilityByName( await provider.getAbilities(), ability.name );
			if (
				! getToolProviders().includes( provider ) ||
				! liveAbility ||
				! shouldExposeWebMcpAbility( liveAbility ) ||
				JSON.stringify( getToolDescriptor( liveAbility ) ) !== fingerprint
			) {
				await sync();
				throw new Error(
					`WebMCP tool changed: ${ toolName }. Discover tools again before retrying.`
				);
			}
			if ( isAborted() ) {
				throw createAbortError();
			}
			const contract = getWebMcpContract( ability );
			const rawInput = input ?? {};
			const preparedInput = contract.prepareInput
				? contract.prepareInput( rawInput, context )
				: rawInput;
			const result = await provider.executeAbility( ability.name, preparedInput );
			contract.afterExecute?.( result, context );
			return contract.adaptResult ? contract.adaptResult( result ) : result;
		};

	const reconcile = async () => {
		let failure: { error: unknown } | undefined;
		const candidates = await collectToolProviderAbilities( getToolProviders(), ( error ) => {
			failure ??= { error };
		} );
		const abilities = [ ...candidates.values() ].map( ( { ability } ) => ability );
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
		for ( const [ abilityName, ability ] of exposed ) {
			if ( disposed ) {
				break;
			}
			const { provider } = candidates.get( abilityName )!;
			const descriptor = getToolDescriptor( ability );
			const fingerprint = JSON.stringify( descriptor );
			const current = registrations.get( abilityName );

			if ( current?.fingerprint === fingerprint && current.provider === provider ) {
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
			const registration = { abortController, fingerprint, provider, toolName: descriptor.name };
			pendingControllers.add( abortController );

			try {
				await modelContext.registerTool(
					{
						...descriptor,
						execute: createExecution( ability, registration ),
					},
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
