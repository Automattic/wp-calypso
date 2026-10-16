import { subscribe } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { amToolProvider, preloadAmEditorContentContext, registerAmAbilities } from '../abilities';
import { errorResult } from '../abilities/ability-result';
import { resolveContextEntries } from '../utils/create-agent-config';
import {
	createEmbeddedPageMessage,
	getEmbeddedParentOrigin,
	getSupportedEmbeddedContext,
	isAllowedEmbeddedParentOrigin,
	isEmbeddedInFullscreen,
	isEmbeddedPageExecutePayload,
	isEmbeddedPageMessage,
	isSupportedEmbeddedAbility,
	type SerializableAbility,
} from '../utils/embedded-page-protocol';
import { getAgentsManagerInlineData } from '../utils/get-agents-manager-inline-data';
import { loadExternalProviders } from '../utils/load-external-providers';
import type { Ability } from '../extension-types';

const CONTEXT_DEBOUNCE_MS = 150;
const FALLBACK_PARENT_ORIGINS = [
	'https://wordpress.com',
	'https://my.wordpress.com',
	'http://my.localhost:3000',
	'http://calypso.localhost:3000',
];

type EmbeddedBridgeWindow = Window & { __agentsManagerEmbeddedBridgeMounted?: boolean };

/** Keeps schemas and metadata but never sends executable ability callbacks across windows. */
function getSerializableAbility( ability: Ability ): SerializableAbility {
	return {
		name: ability.name,
		...( ability.label && { label: ability.label } ),
		...( ability.description && { description: ability.description } ),
		...( ability.category && { category: ability.category } ),
		...( ability.input_schema && { input_schema: ability.input_schema } ),
		...( ability.output_schema && { output_schema: ability.output_schema } ),
		...( ability.meta && { meta: ability.meta } ),
	};
}

function getSerializableSnapshot( value: unknown ): unknown {
	try {
		// Context entries can carry lazy closures and provider-owned values. The
		// bridge sends only the JSON data the backend can consume.
		return JSON.parse( JSON.stringify( value ) );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( '[AgentsManager] Could not serialize embedded page context:', error );
		return {};
	}
}

function postToParent( message: ReturnType< typeof createEmbeddedPageMessage > ): void {
	const parentOrigin = getEmbeddedParentOrigin();
	if ( parentOrigin ) {
		window.parent.postMessage( message, parentOrigin );
		return;
	}

	for ( const origin of FALLBACK_PARENT_ORIGINS ) {
		window.parent.postMessage( message, origin );
	}
}

/**
 * Runs the editor-side provider bridge without mounting any chat UI. A global
 * claim prevents the Gutenberg and wp-admin bundles from serving the same frame twice.
 */
export default function EmbeddedPageBridge() {
	useEffect( () => {
		if ( ! isEmbeddedInFullscreen() ) {
			return;
		}

		const bridgeWindow = window as EmbeddedBridgeWindow;
		if ( bridgeWindow.__agentsManagerEmbeddedBridgeMounted ) {
			return;
		}
		bridgeWindow.__agentsManagerEmbeddedBridgeMounted = true;

		let isDisposed = false;
		let contextTimer: ReturnType< typeof setTimeout > | undefined;
		let removeStoreSubscription: ( () => void ) | undefined;
		let removeMessageListener: ( () => void ) | undefined;

		async function startBridge(): Promise< void > {
			await registerAmAbilities();
			await preloadAmEditorContentContext();
			const providers = await loadExternalProviders();
			if ( isDisposed ) {
				return;
			}

			const toolProvider = providers.toolProvider ?? amToolProvider;
			const fallbackEnvironment = getAgentsManagerInlineData()?.sectionName || 'wp-admin';
			const getContext = () => {
				try {
					const providerContext = providers.contextProvider?.getClientContext() ?? {
						url: window.location.href,
						pathname: window.location.pathname,
						search: window.location.search,
						environment: fallbackEnvironment,
					};
					const resolvedContext = providerContext.contextEntries?.length
						? {
								...providerContext,
								contextEntries: resolveContextEntries( providerContext.contextEntries ),
							}
						: providerContext;
					return getSerializableSnapshot( getSupportedEmbeddedContext( resolvedContext ) );
				} catch ( error ) {
					// eslint-disable-next-line no-console
					console.error( '[AgentsManager] Could not read embedded page context:', error );
					return {};
				}
			};
			const initialContext = getContext() as Record< string, unknown >;
			const environment =
				typeof initialContext.environment === 'string'
					? initialContext.environment
					: fallbackEnvironment;

			const pushContext = ( id?: string ) => {
				postToParent( createEmbeddedPageMessage( 'context', getContext(), id ) );
			};
			const scheduleContext = () => {
				if ( contextTimer ) {
					clearTimeout( contextTimer );
				}
				contextTimer = setTimeout( pushContext, CONTEXT_DEBOUNCE_MS );
			};

			const onMessage = async ( event: MessageEvent ) => {
				if (
					event.source !== window.parent ||
					! isAllowedEmbeddedParentOrigin( event.origin ) ||
					! isEmbeddedPageMessage( event.data )
				) {
					return;
				}

				const message = event.data;
				if ( message.type === 'get-context' ) {
					pushContext( message.id );
					return;
				}
				if ( message.type === 'get-abilities' ) {
					try {
						const abilities = ( await toolProvider.getAbilities() )
							.filter( ( ability ) => isSupportedEmbeddedAbility( ability.name ) )
							.map( getSerializableAbility );
						postToParent( createEmbeddedPageMessage( 'abilities', abilities, message.id ) );
					} catch ( error ) {
						// eslint-disable-next-line no-console
						console.error( '[AgentsManager] Could not load embedded page abilities:', error );
						postToParent(
							createEmbeddedPageMessage(
								'abilities',
								{ error: error instanceof Error ? error.message : 'Could not load abilities.' },
								message.id
							)
						);
					}
					return;
				}
				if (
					message.type === 'execute-ability' &&
					isEmbeddedPageExecutePayload( message.payload )
				) {
					let result: unknown;
					if ( ! isSupportedEmbeddedAbility( message.payload.name ) ) {
						result = errorResult(
							`Ability "${ message.payload.name }" is unavailable in embedded page mode.`
						);
					} else {
						try {
							result = await toolProvider.executeAbility(
								message.payload.name,
								message.payload.args
							);
						} catch ( error ) {
							result = errorResult(
								error instanceof Error ? error.message : 'Embedded ability execution failed.'
							);
						}
					}
					postToParent(
						createEmbeddedPageMessage(
							'ability-result',
							getSerializableSnapshot( result ),
							message.id
						)
					);
				}
			};

			window.addEventListener( 'message', onMessage );
			removeMessageListener = () => window.removeEventListener( 'message', onMessage );
			removeStoreSubscription = subscribe( scheduleContext );
			postToParent(
				createEmbeddedPageMessage( 'ready', { environment, url: window.location.href } )
			);
			pushContext();
		}

		startBridge().catch( ( error ) => {
			// eslint-disable-next-line no-console
			console.error( '[AgentsManager] Could not start embedded page bridge:', error );
		} );

		return () => {
			isDisposed = true;
			if ( contextTimer ) {
				clearTimeout( contextTimer );
			}
			removeStoreSubscription?.();
			removeMessageListener?.();
			delete bridgeWindow.__agentsManagerEmbeddedBridgeMounted;
		};
	}, [] );

	return null;
}
