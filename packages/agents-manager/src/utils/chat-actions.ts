// Minimal view of the package's runtime `window.__agentsManagerActions` global
// (full type: `AgentsManagerActions` in `@automattic/agents-manager`) — only the
// actions the masterbar calls, kept local to stay decoupled across the bundle.
interface AgentsManagerActions {
	resumeChat: () => void;
	setChatOpen: ( isOpen: boolean ) => void;
	isChatVisible: () => boolean;
	isReady?: boolean;
}

const getAgentsManagerActions = (): AgentsManagerActions | undefined =>
	( window as unknown as { __agentsManagerActions?: AgentsManagerActions } ).__agentsManagerActions;

/**
 * Open the agents-manager chat, resuming the tab's conversation rather than
 * starting a new one. Actions load asynchronously, so if they aren't ready yet,
 * wait for the one-time `agents-manager-ready` event.
 */
export const openAgentsManagerChat = (): void => {
	const openChat = ( actions: AgentsManagerActions | undefined ) => {
		actions?.resumeChat();
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

/**
 * Whether the chat is visible (open and not minimized). Entry points use this to
 * toggle: re-clicking while visible closes it; otherwise it opens (which also
 * expands a minimized chat).
 */
export const isAgentsManagerChatVisible = (): boolean =>
	!! getAgentsManagerActions()?.isChatVisible?.();
