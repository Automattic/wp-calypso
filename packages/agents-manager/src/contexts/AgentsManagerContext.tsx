import { createContext, useCallback, useContext, useState } from '@wordpress/element';
import { getSessionId } from '../utils/agent-session';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';
import type { AgentsManagerSite, CurrentUser } from '@automattic/data-stores';

/**
 * Context type for AgentsManager data.
 *
 * This context provides user, site, and section data to all components
 * in the AgentsManager tree, avoiding prop drilling.
 */
export interface AgentsManagerContextType {
	/** The current user object. */
	currentUser?: CurrentUser;
	/** Whether the current user is logged in. Derived from `currentUser.ID`. */
	isLoggedIn: boolean;
	/** The selected site object. */
	site?: AgentsManagerSite | null;
	/** The name of the current section (e.g., 'wp-admin', 'gutenberg'). */
	sectionName: string;
	/** The current route path. */
	currentRoute?: string;
	/**
	 * Whether the user is eligible for chat support.
	 *
	 * TODO: Implement with dedicated endpoint. Currently hardcoded to false.
	 */
	isEligibleForChat: boolean;
	/** The agent configuration created during setup. */
	agentConfig: UseAgentChatConfig | null;
	/** Sets the agent configuration (called from AgentSetup after initialization). */
	setAgentConfig: ( config: UseAgentChatConfig | null ) => void;
	/** Returns the active session ID from agentConfig or stored session. */
	getActiveSessionId: () => string;
}

const defaultContext: AgentsManagerContextType = {
	currentUser: undefined,
	isLoggedIn: false,
	site: null,
	sectionName: 'wp-admin',
	currentRoute: undefined,
	isEligibleForChat: false,
	agentConfig: null,
	setAgentConfig: () => {},
	getActiveSessionId: () => '',
};

const AgentsManagerContext = createContext< AgentsManagerContextType >( defaultContext );

export interface AgentsManagerContextProviderProps {
	children: React.ReactNode;
	value: Partial<
		Pick< AgentsManagerContextType, 'currentUser' | 'site' | 'currentRoute' | 'isEligibleForChat' >
	> & { sectionName: string };
}

/**
 * Provider component that makes AgentsManager data available to all children.
 */
export const AgentsManagerContextProvider: React.FC< AgentsManagerContextProviderProps > = ( {
	children,
	value,
} ) => {
	const [ agentConfig, setAgentConfig ] = useState< UseAgentChatConfig | null >( null );
	const isLoggedIn = value.currentUser?.ID !== undefined;

	const getActiveSessionId = useCallback( () => {
		return agentConfig?.sessionId || getSessionId( agentConfig?.agentId );
	}, [ agentConfig ] );

	return (
		<AgentsManagerContext.Provider
			value={ {
				...defaultContext,
				...value,
				isLoggedIn,
				agentConfig,
				setAgentConfig,
				getActiveSessionId,
			} }
		>
			{ children }
		</AgentsManagerContext.Provider>
	);
};

/**
 * Hook to access AgentsManager context data.
 *
 * Must be used within an AgentsManagerContextProvider.
 * @returns The current context value with user, site, and section data.
 */
export function useAgentsManagerContext(): AgentsManagerContextType {
	return useContext( AgentsManagerContext );
}
