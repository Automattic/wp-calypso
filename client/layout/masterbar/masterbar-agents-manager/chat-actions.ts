import type { NavigateFunction } from 'react-router-dom';

// Minimal view of the package's runtime `window.__agentsManagerActions` global
// (full type: `AgentsManagerActions` in `@automattic/agents-manager`) — only the
// actions the masterbar calls, kept local to stay decoupled across the bundle.
interface AgentsManagerActions {
	chatNavigate: NavigateFunction;
	resumeChat: () => void;
	setChatOpen: ( isOpen: boolean ) => void;
	isReady?: boolean;
}

const getAgentsManagerActions = (): AgentsManagerActions | undefined =>
	( window as unknown as { __agentsManagerActions?: AgentsManagerActions } ).__agentsManagerActions;

/**
 * Open the agents-manager chat. With a `path`, navigate there first (the Help menu's
 * history/guides items). Without a path, resume the active conversation rather than
 * start a new one — used by both the AI entry button and the "Chat Support" item.
 * Actions load asynchronously, so if they aren't ready yet, wait for the one-time
 * `agents-manager-ready` event.
 */
export const openAgentsManagerChat = ( path?: string ): void => {
	const openChat = ( actions: AgentsManagerActions | undefined ) => {
		if ( path !== undefined ) {
			actions?.chatNavigate( path );
		} else {
			actions?.resumeChat();
		}
		actions?.setChatOpen( true );
	};

	const actions = getAgentsManagerActions();
	if ( actions?.isReady ) {
		openChat( actions );
		return;
	}

	window.addEventListener( 'agents-manager-ready', () => openChat( getAgentsManagerActions() ), {
		once: true,
	} );
};

// No readiness wait needed: the chat can only be closed once it is already open.
export const closeAgentsManagerChat = (): void => getAgentsManagerActions()?.setChatOpen( false );
