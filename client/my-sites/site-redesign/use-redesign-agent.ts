import { useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';
import { connectRedesignHost } from './agent-provider';
import type { Redesign } from './api';
import type { RedesignSuccession } from './use-redesign';

type PresentationWindow = Window & {
	__agentsManagerConfig?: {
		chatPresentation?: {
			dismissible?: boolean;
			showEntryPoints?: boolean;
			embeddedContainer?: string;
		};
	};
};

type ChatActions = {
	startNewChat?: () => Promise< void >;
	isTurnInFlight?: () => boolean;
};
const getChatActions = () => window.__agentsManagerActions as ChatActions | undefined;

/** How long the native chat may take to load and discard the old conversation. */
const RESET_TIMEOUT = 10000;
const RESET_POLL_INTERVAL = 100;

/**
 * Whether the native agent is mid-turn, from its window turn events.
 *
 * Tracked at module scope like the chat's own announcement: the chat only
 * broadcasts edges and never replays a running turn, so a workspace that
 * remounts mid-stream would otherwise read idle until the turn ends.
 */
let agentTurnActive = false;
const agentTurnListeners = new Set< () => void >();
function setAgentTurnActive( isActive: boolean ) {
	agentTurnActive = isActive;
	agentTurnListeners.forEach( ( listener ) => listener() );
}
/** The events carry edges only; the chat's manager knows whether a turn is running now. */
function seedAgentTurn() {
	const isTurnInFlight = getChatActions()?.isTurnInFlight;
	if ( isTurnInFlight ) {
		setAgentTurnActive( isTurnInFlight() );
	}
}
if ( typeof window !== 'undefined' ) {
	window.addEventListener( 'agents-manager-turn-started', () => setAgentTurnActive( true ) );
	window.addEventListener( 'agents-manager-turn-ended', () => setAgentTurnActive( false ) );
	window.addEventListener( 'agents-manager-ready', seedAgentTurn );
}
function subscribeAgentTurn( listener: () => void ) {
	agentTurnListeners.add( listener );
	seedAgentTurn();
	return () => {
		agentTurnListeners.delete( listener );
	};
}
export function useAgentTurnActivity(): boolean {
	return useSyncExternalStore(
		subscribeAgentTurn,
		() => agentTurnActive,
		() => false
	);
}

/** Configures the existing manager after its host mounts and observes real chat readiness. */
export function useRedesignAgent(
	run: Redesign | null,
	succession: RedesignSuccession | null = null,
	applyOnly = false
) {
	const hostWindow = window as PresentationWindow;
	const [ hostReady, setHostReady ] = useState( false );
	const [ agentUnavailable, setAgentUnavailable ] = useState( false );
	const [ connected, setConnected ] = useState( false );
	useLayoutEffect( () => {
		const previous = hostWindow.__agentsManagerConfig;
		const config = {
			...previous,
			chatPresentation: {
				dismissible: false,
				showEntryPoints: false,
				embeddedContainer: '#site-redesign-agent',
			},
		};
		hostWindow.__agentsManagerConfig = config;
		setHostReady( true );
		return () => {
			if ( hostWindow.__agentsManagerConfig === config ) {
				hostWindow.__agentsManagerConfig = previous;
			}
		};
	}, [ hostWindow ] );
	const successionFrom = succession?.from;
	const successionTo = succession?.to;
	// The successor whose fresh conversation the native chat has confirmed.
	const [ resetFor, setResetFor ] = useState< string | null >( null );
	const [ resetFailed, setResetFailed ] = useState( false );
	const resetPending = !! successionTo && resetFor !== successionTo;
	// No run is offered while the conversation is being replaced, so no provider
	// created in that window can bind to the successor.
	useLayoutEffect( () => {
		if ( run?.eligibility.can_preview && ! resetPending ) {
			return connectRedesignHost( { run, applyOnly } );
		}
	}, [ run, resetPending, applyOnly ] );
	// A fresh run gets a fresh conversation through the chat's own new-chat
	// lifecycle, which aborts and removes the old agent and clears the stored
	// session before it resolves. Until then the chat stays mounted for the old
	// run, whose provider withholds the successor's context; if it never
	// confirms, the agent is shown as unavailable rather than reused.
	useEffect( () => {
		setResetFailed( false );
		if ( ! successionFrom || ! successionTo ) {
			return;
		}
		let cancelled = false;
		let timer: ReturnType< typeof setTimeout > | undefined;
		const deadline = Date.now() + RESET_TIMEOUT;
		// Once failed, a late confirmation is ignored: the chat stays unavailable.
		const fail = () => {
			if ( ! cancelled ) {
				cancelled = true;
				setResetFailed( true );
			}
		};
		const begin = () => {
			const startNewChat = getChatActions()?.startNewChat;
			if ( ! startNewChat ) {
				if ( Date.now() >= deadline ) {
					fail();
					return;
				}
				timer = setTimeout( begin, RESET_POLL_INTERVAL );
				return;
			}
			timer = setTimeout( fail, Math.max( 0, deadline - Date.now() ) );
			startNewChat().then( () => {
				clearTimeout( timer );
				if ( ! cancelled ) {
					setResetFor( successionTo );
				}
			}, fail );
		};
		begin();
		return () => {
			cancelled = true;
			clearTimeout( timer );
		};
	}, [ successionFrom, successionTo ] );
	// Remounting the chat for the fresh run creates its provider, bound to that run.
	const conversationKey = resetPending ? successionFrom : run?.id;
	useEffect( () => {
		setConnected( false );
		setAgentUnavailable( false );
		if ( ! hostReady || ! conversationKey ) {
			return;
		}
		const host = document.getElementById( 'site-redesign-agent' );
		if ( ! host ) {
			return;
		}
		const timer = setTimeout( () => setAgentUnavailable( true ), 20000 );
		const checkReady = () => {
			if (
				host.querySelector( '.agents-manager-chat--embedded .agenttic' ) &&
				window.__agentsManagerActions?.submitChatMessage
			) {
				clearTimeout( timer );
				setConnected( true );
				setAgentUnavailable( false );
			}
		};
		const observer = new MutationObserver( checkReady );
		observer.observe( host, { childList: true, subtree: true } );
		window.addEventListener( 'agents-manager-ready', checkReady );
		checkReady();
		return () => {
			clearTimeout( timer );
			observer.disconnect();
			window.removeEventListener( 'agents-manager-ready', checkReady );
		};
	}, [ hostReady, conversationKey ] );
	return {
		ready: hostReady && !! run?.eligibility.can_preview,
		connected: connected && ! resetPending,
		agentUnavailable: agentUnavailable || resetFailed,
		conversationKey,
	};
}
