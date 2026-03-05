import { createContext, useContext, useState } from '@wordpress/element';
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
};

const AgentsManagerContext = createContext< AgentsManagerContextType >( defaultContext );

/**
 * Props for AgentsManagerContextProvider.
 *
 * Requires `sectionName` to be provided. Other fields are optional
 * and will use defaults if not provided.
 */
export interface AgentsManagerContextProviderProps {
	children: React.ReactNode;
	value: Partial< AgentsManagerContextType > & Pick< AgentsManagerContextType, 'sectionName' >;
}

/**
 * Provider component that makes AgentsManager data available to all children.
 *
 * Usage:
 * ```tsx
 * <AgentsManagerContextProvider value={{ sectionName: 'wp-admin', currentUser, site }}>
 *   <YourComponent />
 * </AgentsManagerContextProvider>
 * ```
 */
export const AgentsManagerContextProvider: React.FC< AgentsManagerContextProviderProps > = ( {
	children,
	value,
} ) => {
	const [ agentConfig, setAgentConfig ] = useState< UseAgentChatConfig | null >( null );
	const isLoggedIn = value.currentUser?.ID !== undefined;

	return (
		<AgentsManagerContext.Provider
			value={ { ...defaultContext, ...value, isLoggedIn, agentConfig, setAgentConfig } }
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
