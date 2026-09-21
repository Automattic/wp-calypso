import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { AGENTS_MANAGER_STORE } from '../../stores';
import { markActionOrigin } from '../../utils/action-origin';
import {
	removeExternalContextCard,
	removeExternalContextEntry,
	setExternalContextCard,
	setExternalContextEntry,
} from '../../utils/external-context';
import { isReaderChatAgent } from '../../utils/is-reader-chat-agent';
import { setSiteEditorAction } from '../../utils/site-editor-context';
import { getTabId } from '../../utils/tab-id';
import {
	BIG_SKY_EVENT_PREFIX,
	recordAgentsManagerTracksEvent,
	recordBigSkyTracksEvent,
	type BigSkyEventName,
} from '../../utils/tracks';
import type { AgentsManagerSelect } from '@automattic/data-stores';

/** Bridge-facing recorder: drops malformed calls instead of emitting `jetpack_big_sky_undefined`. */
function recordGuardedBigSkyTracksEvent(
	eventName: BigSkyEventName,
	props?: Record< string, unknown >
): void {
	if (
		typeof eventName !== 'string' ||
		! eventName.startsWith( BIG_SKY_EVENT_PREFIX ) ||
		eventName === BIG_SKY_EVENT_PREFIX
	) {
		return;
	}

	recordBigSkyTracksEvent( eventName, props );
}

/** Tracks values are lowercase with underscores; hosts pass free text like "WooCommerce AI". */
function toTracksValue( value: unknown ): string {
	const normalized =
		typeof value === 'string'
			? value
					.trim()
					.toLowerCase()
					.replace( /[^a-z0-9]+/g, '_' )
					.replace( /^_|_$/g, '' )
			: '';
	return normalized || 'none';
}

/**
 * Bridge-facing context publisher: records that a host handed the chat
 * something to talk about, so the hand-off is a step in the journey.
 */
function publishExternalContextEntry(
	entry: Parameters< typeof setExternalContextEntry >[ 0 ]
): void {
	setExternalContextEntry( entry );
	if ( ! entry?.id ) {
		return;
	}
	recordAgentsManagerTracksEvent( 'calypso_agents_manager_context_published', {
		source: toTracksValue( entry.source ),
		type: toTracksValue( entry.type ),
		delivery: toTracksValue( entry.delivery || 'next-message' ),
	} );
}

/**
 * Publish actions onto `window.__agentsManagerActions`. Cleanup removes only
 * keys whose value is still ours, so callers can co-own the global. See
 * `README.md` for usage rules.
 */
export function useRegisterCustomActions( actions: Partial< AgentsManagerActions > ): void {
	// No deps array: re-sync every commit so the global stays correct even when
	// the set of keys changes (a computed deps array must keep a fixed length).
	useEffect( () => {
		const current = ( window.__agentsManagerActions ??= {} as AgentsManagerActions );
		Object.assign( current, actions );

		return () => {
			// Re-read the global rather than reusing `current`: a consumer may have
			// replaced it since we published, and we must clean up the live object.
			const latest = window.__agentsManagerActions;
			if ( ! latest ) {
				return;
			}
			( Object.keys( actions ) as ( keyof AgentsManagerActions )[] ).forEach( ( key ) => {
				if ( latest[ key ] === actions[ key ] ) {
					delete latest[ key ];
				}
			} );
		};
	} );
}

interface SetupProps {
	dock: () => void;
	undock: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	canDock: boolean;
	setIsCompactMode: ( isCompact: boolean ) => void;
	setIsChatEnabled: ( isEnabled: boolean ) => void;
	setDesktopMediaQuery: ( query: string ) => void;
}

/**
 * Wire up the built-in actions on `window.__agentsManagerActions` and
 * dispatch `agents-manager-ready` once they're available. Mounted with
 * the agent dock.
 */
export function useSetupCustomActions( {
	dock,
	undock,
	openSidebar,
	closeSidebar,
	canDock,
	setIsCompactMode,
	setIsChatEnabled,
	setDesktopMediaQuery,
}: SetupProps ): void {
	const { hasLoaded, isOpen, isDocked, isMinimized, floatingPosition, isChatVisible } = useSelect(
		( select ) => {
			const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
			return store.getAgentsManagerState();
		},
		[]
	);
	const { setIsOpen, setIsDocked, setIsMinimized } = useDispatch( AGENTS_MANAGER_STORE );
	const { agentConfig, getTabSessionId, resumeChat } = useAgentsManagerContext();
	const navigate = useNavigate();
	const location = useLocation();
	// Keep the latest location in a ref so `getCurrentRoute` stays a stable
	// reference while always reporting the chat's current route.
	const locationRef = useRef( location );
	locationRef.current = location;
	const resolveRef = useRef< ( ( state: AgentsManagerChatState ) => void ) | null >( null );
	const shouldPersistOpenState = ! isReaderChatAgent( agentConfig?.agentId );

	const setChatOpen = useCallback(
		( shouldOpen: boolean ) => {
			if ( typeof shouldOpen !== 'boolean' ) {
				return;
			}

			// Persist only what changes — a redundant save can race with a
			// concurrent one and clobber it.
			if ( shouldOpen && isMinimized ) {
				setIsMinimized( false );
			}

			// Mark any host call that will make the chat visible, including an
			// un-minimize: `isOpen` stays true there, but the dock still records
			// `chat_opened` because `chatIsOpen` flips, and that event must not
			// fall through to `trigger=user`.
			if ( shouldOpen && ( ! isOpen || isMinimized ) ) {
				markActionOrigin( 'open', 'host' );
			}

			// Open state is unchanged; nothing more to persist.
			if ( shouldOpen === isOpen ) {
				return;
			}

			if ( ! isDocked || ! canDock ) {
				return setIsOpen( shouldOpen, shouldPersistOpenState );
			}

			if ( shouldOpen ) {
				openSidebar();
			} else {
				closeSidebar();
			}
		},
		[
			canDock,
			closeSidebar,
			isDocked,
			isMinimized,
			isOpen,
			openSidebar,
			setIsMinimized,
			setIsOpen,
			shouldPersistOpenState,
		]
	);

	const setChatDocked = useCallback(
		( shouldDock: boolean ) => {
			if ( typeof shouldDock !== 'boolean' ) {
				return;
			}

			if ( shouldDock ) {
				dock();
			} else {
				undock();
			}

			setIsDocked( shouldDock );
		},
		[ dock, setIsDocked, undock ]
	);

	const setChatCompactMode = useCallback(
		( isCompact: boolean ) => {
			if ( typeof isCompact !== 'boolean' ) {
				return;
			}

			setIsCompactMode( isCompact );
		},
		[ setIsCompactMode ]
	);

	const setChatEnabled = useCallback(
		( isEnabled: boolean ) => {
			if ( typeof isEnabled !== 'boolean' ) {
				return;
			}

			setIsChatEnabled( isEnabled );
		},
		[ setIsChatEnabled ]
	);

	const setChatDesktopMediaQuery = useCallback(
		( query: string ) => {
			if ( typeof query !== 'string' ) {
				return;
			}

			setDesktopMediaQuery( query );
		},
		[ setDesktopMediaQuery ]
	);

	const getChatState = useCallback( (): Promise< AgentsManagerChatState > => {
		if ( hasLoaded ) {
			return Promise.resolve( {
				isOpen,
				isDocked,
				floatingPosition,
			} );
		}

		return new Promise( ( resolve ) => {
			resolveRef.current = resolve;
		} );
	}, [ hasLoaded, isOpen, isDocked, floatingPosition ] );

	// Resolve any pending `getChatState()` call once the store has loaded.
	useEffect( () => {
		if ( hasLoaded && resolveRef.current ) {
			resolveRef.current( {
				isOpen,
				isDocked,
				floatingPosition,
			} );
			resolveRef.current = null;
		}
	}, [ hasLoaded, isOpen, isDocked, floatingPosition ] );

	// Entry points outside the bundle (the omnibar AI and Help buttons, Jetpack's
	// AI sidebar) read this to decide whether a click closes or opens.
	const getIsChatVisible = useCallback( () => isChatVisible, [ isChatVisible ] );

	// The chat's current route (e.g. `/chat`), so callers can detect a same-route re-click.
	const getCurrentRoute = useCallback( () => locationRef.current.pathname, [] );

	useRegisterCustomActions( {
		getChatState,
		isChatVisible: getIsChatVisible,
		getCurrentRoute,
		getSessionId: getTabSessionId,
		getTabId,
		recordBigSkyTracksEvent: recordGuardedBigSkyTracksEvent,
		setChatOpen,
		setChatDocked,
		setChatEnabled,
		setChatCompactMode,
		setChatDesktopMediaQuery,
		setContextEntry: publishExternalContextEntry,
		removeContextEntry: removeExternalContextEntry,
		setContextCard: setExternalContextCard,
		removeContextCard: removeExternalContextCard,
		setSiteEditorAction,
		chatNavigate: navigate,
		resumeChat,
		isReady: true,
		// See the field's doc in global.d.ts. Advertised here, where the API
		// is assembled, so a host reading it can trust the events are wired.
		broadcastsAgentActivity: true,
	} );

	// Hosts (e.g. CIAB) listen for `agents-manager-ready` to invoke actions without polling.
	useEffect( () => {
		window.dispatchEvent( new CustomEvent( 'agents-manager-ready' ) );
	}, [] );
}
