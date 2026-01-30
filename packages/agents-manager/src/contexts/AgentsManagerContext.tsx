import { createContext, useContext } from '@wordpress/element';
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
	/** The selected site object. */
	site?: AgentsManagerSite | null;
	/** The name of the current section (e.g., 'wp-admin', 'gutenberg'). */
	sectionName: string;
	/**
	 * Whether the user is eligible for chat support.
	 *
	 * TODO: Implement with dedicated endpoint. Currently hardcoded to false.
	 */
	isEligibleForChat: boolean;
}

const defaultContext: AgentsManagerContextType = {
	currentUser: undefined,
	site: null,
	sectionName: 'wp-admin',
	isEligibleForChat: false,
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
	return (
		<AgentsManagerContext.Provider value={ { ...defaultContext, ...value } }>
			{ children }
		</AgentsManagerContext.Provider>
	);
};

/**
 * Hook to access AgentsManager context data.
 *
 * Must be used within an AgentsManagerContextProvider.
 *
 * @returns The current context value with user, site, and section data.
 */
export function useAgentsManagerContext(): AgentsManagerContextType {
	return useContext( AgentsManagerContext );
}
