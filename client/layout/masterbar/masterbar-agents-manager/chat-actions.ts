interface AgentsManagerActions {
	chatNavigate: ( path: string ) => void;
	setChatOpen: ( isOpen: boolean ) => void;
	isReady?: boolean;
}

const getAgentsManagerActions = (): AgentsManagerActions | undefined =>
	( window as unknown as { __agentsManagerActions?: AgentsManagerActions } ).__agentsManagerActions;

/**
 * Open the agents-manager chat at the given path. Its actions load asynchronously,
 * so if they aren't ready yet, wait for the one-time `agents-manager-ready` event.
 */
export const openAgentsManagerChat = ( path: string ): void => {
	const openChat = ( actions: AgentsManagerActions | undefined ) => {
		actions?.chatNavigate( path );
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
