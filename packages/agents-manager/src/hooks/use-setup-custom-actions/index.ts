import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { useAgentsManagerContext } from '../../contexts';
import { AGENTS_MANAGER_STORE } from '../../stores';
import {
	removeExternalContextCard,
	removeExternalContextEntry,
	setExternalContextCard,
	setExternalContextEntry,
} from '../../utils/external-context';
import { isReaderChatAgent } from '../../utils/is-reader-chat-agent';
import type { AgentsManagerSelect } from '@automattic/data-stores';

// Action keys this hook owns on `window.__agentsManagerActions`. Cleanup
// only removes these so other consumers writing to the same object (for
// example `OrchestratorChat`'s `setChatInput`/`submitChatMessage`) survive
// re-runs of this effect's deps.
const OWNED_ACTION_KEYS: ReadonlyArray< keyof AgentsManagerActions > = [
	'getChatState',
	'getSessionId',
	'setChatOpen',
	'setChatDocked',
	'setChatEnabled',
	'setChatCompactMode',
	'setChatDesktopMediaQuery',
	'setContextEntry',
	'removeContextEntry',
	'setContextCard',
	'removeContextCard',
	'chatNavigate',
	'isReady',
];

interface Props {
	dock: () => void;
	undock: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	canDock: boolean;
	setIsCompactMode: ( isCompact: boolean ) => void;
	setShouldRenderChat: ( shouldRender: boolean ) => void;
	setDesktopMediaQuery: ( query: string ) => void;
}

export default function useSetupCustomActions( {
	dock,
	undock,
	openSidebar,
	closeSidebar,
	canDock,
	setIsCompactMode,
	setShouldRenderChat,
	setDesktopMediaQuery,
}: Props ) {
	const { hasLoaded, isOpen, isDocked, floatingPosition } = useSelect( ( select ) => {
		const store: AgentsManagerSelect = select( AGENTS_MANAGER_STORE );
		return store.getAgentsManagerState();
	}, [] );
	const { setIsOpen, setIsDocked } = useDispatch( AGENTS_MANAGER_STORE );
	const { agentConfig, getActiveSessionId } = useAgentsManagerContext();
	const navigate = useNavigate();
	const resolveRef = useRef< ( ( state: AgentsManagerChatState ) => void ) | null >( null );
	const hasFiredReadyRef = useRef( false );
	const shouldPersistOpenState = ! isReaderChatAgent( agentConfig?.agentId );

	const setChatOpen = useCallback(
		( shouldOpen: boolean ) => {
			if ( typeof shouldOpen !== 'boolean' ) {
				return;
			}

			if ( ! isDocked || ! canDock ) {
				return setIsOpen( shouldOpen, shouldPersistOpenState );
			}

			if ( shouldOpen ) {
				openSidebar();
			}

			if ( ! shouldOpen ) {
				closeSidebar();
			}
		},
		[ canDock, closeSidebar, isDocked, openSidebar, setIsOpen, shouldPersistOpenState ]
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

			setShouldRenderChat( isEnabled );
		},
		[ setShouldRenderChat ]
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

	useEffect( () => {
		const state = {
			isOpen: !! isOpen,
			isDocked: !! isDocked,
			floatingPosition: floatingPosition || '',
		};

		// Resolve any pending `getChatState()` call with the latest state.
		if ( hasLoaded && resolveRef.current ) {
			resolveRef.current( state );
			resolveRef.current = null;
		}

		window.__agentsManagerActions = {
			...window.__agentsManagerActions,
			// Declared inline to capture the fresh `state` from this effect.
			getChatState: () => {
				if ( hasLoaded ) {
					return Promise.resolve( state );
				}
				return new Promise( ( resolve ) => {
					resolveRef.current = resolve;
				} );
			},
			getSessionId: getActiveSessionId,
			setChatOpen,
			setChatDocked,
			setChatEnabled,
			setChatCompactMode,
			setChatDesktopMediaQuery,
			setContextEntry: setExternalContextEntry,
			removeContextEntry: removeExternalContextEntry,
			setContextCard: setExternalContextCard,
			removeContextCard: removeExternalContextCard,
			chatNavigate: navigate,
			isReady: true,
		};

		// Fire the ready event exactly once per mount, after the global has
		// been fully populated. Hosts (e.g. CIAB) listen for this to safely
		// invoke actions like `setChatOpen` without polling.
		if ( ! hasFiredReadyRef.current ) {
			hasFiredReadyRef.current = true;
			window.dispatchEvent( new CustomEvent( 'agents-manager-ready' ) );
		}

		return () => {
			const actions = window.__agentsManagerActions;
			if ( ! actions ) {
				return;
			}
			OWNED_ACTION_KEYS.forEach( ( key ) => {
				delete actions[ key ];
			} );
		};
	}, [
		hasLoaded,
		isOpen,
		isDocked,
		floatingPosition,
		setChatOpen,
		setChatDocked,
		setChatEnabled,
		setChatCompactMode,
		setChatDesktopMediaQuery,
		getActiveSessionId,
		navigate,
	] );
}
