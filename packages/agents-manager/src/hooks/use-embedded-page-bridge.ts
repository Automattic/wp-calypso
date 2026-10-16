import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { errorResult } from '../abilities/ability-result';
import { useAgentsManagerContext } from '../contexts';
import {
	createEmbeddedPageMessage,
	isClientContextSnapshot,
	isEmbeddedPageMessage,
	isEmbeddedPageReadyPayload,
} from '../utils/embedded-page-protocol';
import { useSitePanel } from './use-site-panel';
import type { Ability, ClientContextType, ContextProvider, ToolProvider } from '../extension-types';

const BRIDGE_REQUEST_TIMEOUT_MS = 15_000;

interface PendingRequest {
	resolve: ( payload: unknown ) => void;
	timeout: ReturnType< typeof setTimeout >;
}

interface BridgeState {
	environment: string;
	url: string;
}

function createRequestId( sequence: number ): string {
	return `am-embed-${ Date.now() }-${ sequence }`;
}

/**
 * Binds the full-screen chat to the editor iframe's tools and latest context.
 * Requests are scoped to the current frame so closing or replacing it cannot
 * deliver stale editor work into the active agent.
 */
export function useEmbeddedPageBridge(): { isReady: boolean } {
	const { frame, url } = useSitePanel();
	const { setAgentRuntimeOverride } = useAgentsManagerContext();
	const [ bridgeState, setBridgeState ] = useState< BridgeState | null >( null );
	const context = useRef< ClientContextType >( {
		url: '',
		pathname: '',
		search: '',
		environment: 'fullscreen',
	} );
	const pending = useRef( new Map< string, PendingRequest >() );
	const sequence = useRef( 0 );

	useEffect( () => {
		const pendingRequests = pending.current;
		setBridgeState( null );
		for ( const request of pendingRequests.values() ) {
			clearTimeout( request.timeout );
			request.resolve( undefined );
		}
		pendingRequests.clear();

		if ( ! frame || ! url ) {
			return;
		}

		const expectedOrigin = new URL( url ).origin;
		const onMessage = ( event: MessageEvent ) => {
			if (
				event.source !== frame.contentWindow ||
				event.origin !== expectedOrigin ||
				! isEmbeddedPageMessage( event.data )
			) {
				return;
			}

			const message = event.data;
			if ( message.type === 'ready' && isEmbeddedPageReadyPayload( message.payload ) ) {
				setBridgeState( message.payload );
				return;
			}
			if ( message.type === 'context' && isClientContextSnapshot( message.payload ) ) {
				context.current = message.payload;
			}
			if ( message.id ) {
				const request = pendingRequests.get( message.id );
				if ( request ) {
					clearTimeout( request.timeout );
					pendingRequests.delete( message.id );
					request.resolve( message.payload );
				}
			}
		};

		window.addEventListener( 'message', onMessage );
		return () => {
			window.removeEventListener( 'message', onMessage );
			for ( const request of pendingRequests.values() ) {
				clearTimeout( request.timeout );
				request.resolve( undefined );
			}
			pendingRequests.clear();
		};
	}, [ frame, url ] );

	const providers = useMemo( () => {
		if ( ! frame || ! url || ! bridgeState ) {
			return null;
		}

		const targetOrigin = new URL( url ).origin;
		const request = ( type: 'get-abilities' | 'execute-ability', payload?: unknown ) => {
			const id = createRequestId( ++sequence.current );
			return new Promise< unknown >( ( resolve ) => {
				const timeout = setTimeout( () => {
					pending.current.delete( id );
					resolve( undefined );
				}, BRIDGE_REQUEST_TIMEOUT_MS );
				pending.current.set( id, { resolve, timeout } );
				frame.contentWindow?.postMessage(
					createEmbeddedPageMessage( type, payload, id ),
					targetOrigin
				);
			} );
		};

		const toolProvider: ToolProvider = {
			getAbilities: async () => {
				const abilities = await request( 'get-abilities' );
				return ( Array.isArray( abilities ) ? abilities : [] ) as Ability[];
			},
			executeAbility: async ( name, args ) => {
				const result = await request( 'execute-ability', { name, args } );
				return (
					result ??
					errorResult( `Embedded ability "${ name }" timed out before the editor responded.` )
				);
			},
		};
		const contextProvider: ContextProvider = {
			getClientContext: () => {
				const pageUrl = new URL( bridgeState.url );
				return {
					...context.current,
					url: bridgeState.url,
					pathname: pageUrl.pathname,
					search: pageUrl.search,
					environment: bridgeState.environment,
					currentScreen: { url: bridgeState.url },
				};
			},
		};

		return { toolProvider, contextProvider };
	}, [ bridgeState, frame, url ] );

	useEffect( () => {
		if ( ! bridgeState || ! providers ) {
			setAgentRuntimeOverride( null );
			return;
		}

		setAgentRuntimeOverride( {
			key: bridgeState.url,
			...providers,
			environment: bridgeState.environment,
			url: bridgeState.url,
		} );

		return () => setAgentRuntimeOverride( null );
	}, [ bridgeState, providers, setAgentRuntimeOverride ] );

	return { isReady: !! bridgeState };
}
