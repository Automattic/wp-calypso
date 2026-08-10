import { createContext, useCallback, useContext, useState } from '@wordpress/element';
import { useNavigate } from 'react-router-dom';
import { getSessionId, setSessionSiteKey } from '../utils/agent-session';
import { setResolvedAgentId } from '../utils/resolved-agent-id';
import type { UseAgentChatConfig } from '@automattic/agenttic-client';
import type { AgentsManagerSite, CurrentUser } from '@automattic/data-stores';

/**
 * Context type for AgentsManager data.
 *
 * This context provides user, site, and section data to all components
 * in the `AgentsManager` tree, avoiding prop drilling.
 */
export interface AgentsManagerContextType {
	/** The current user object. */
	currentUser?: CurrentUser;
	/** Whether the current user is logged in. Derived from `currentUser.ID`. */
	isLoggedIn: boolean;
	/** The selected site object. */
	site?: AgentsManagerSite | null;
	/** Site key for per-site state: the site ID as a string, or 'no-site' for non-site contexts. */
	siteKey: string;
	/** The name of the current section (e.g., `wp-admin`, `gutenberg`). */
	sectionName: string;
	/** The current route path. */
	currentRoute?: string;
	/**
	 * Whether the user is eligible for chat support.
	 *
	 * TODO: Implement with dedicated endpoint. Currently hardcoded to false.
	 */
	isEligibleForChat: boolean;
	/** Zendesk conversation tags to apply when a new support conversation is created. */
	zendeskConversationTags: string[];
	/** Index selecting a dedicated Smooch integration for new support conversations (e.g. `woo`). */
	zendeskSmoochIntegrationKey?: string;
	/** Zendesk Product ticket-field value to apply to new support conversations. */
	zendeskTicketProductFieldValue?: string;
	/** The agent configuration created during setup. */
	agentConfig: UseAgentChatConfig | null;
	/** Sets the agent configuration (called from `AgentSetup` after initialization). */
	setAgentConfig: ( config: UseAgentChatConfig | null ) => void;
	/** Returns this tab's active session ID from the stored session. */
	getTabSessionId: () => string;
	/** Reopen the chat, resuming this tab's conversation. */
	resumeChat: () => void;
}

const defaultContext: AgentsManagerContextType = {
	currentUser: undefined,
	isLoggedIn: false,
	site: null,
	siteKey: 'no-site',
	sectionName: 'wp-admin',
	currentRoute: undefined,
	isEligibleForChat: false,
	zendeskConversationTags: [],
	agentConfig: null,
	setAgentConfig: () => {},
	getTabSessionId: () => '',
	resumeChat: () => {},
};

const AgentsManagerContext = createContext< AgentsManagerContextType >( defaultContext );

export interface AgentsManagerContextProviderProps {
	children: React.ReactNode;
	value: Partial<
		Pick<
			AgentsManagerContextType,
			| 'currentUser'
			| 'site'
			| 'currentRoute'
			| 'isEligibleForChat'
			| 'zendeskConversationTags'
			| 'zendeskSmoochIntegrationKey'
			| 'zendeskTicketProductFieldValue'
		>
	> & { sectionName: string; siteKey: string };
}

/**
 * Provider component that makes `AgentsManager` data available to all children.
 */
export const AgentsManagerContextProvider: React.FC< AgentsManagerContextProviderProps > = ( {
	children,
	value,
} ) => {
	const [ agentConfig, setAgentConfig ] = useState< UseAgentChatConfig | null >( null );
	const isLoggedIn = value.currentUser?.ID !== undefined;

	const navigate = useNavigate();

	const getTabSessionId = useCallback( () => {
		return getSessionId( agentConfig?.agentId );
	}, [ agentConfig?.agentId ] );

	// `AgentSetup` resolves this tab's stored session, so navigating is all a
	// resume needs.
	const resumeChat = useCallback( () => {
		navigate( '/chat' );
	}, [ navigate ] );

	// Publish the resolved agent id and session site scope for non-React callers.
	// Written in render, not a `useEffect`: children read these during their own
	// render, and event handlers can fire before effects run. The writes are
	// idempotent, so re-running in render is safe.
	setResolvedAgentId( agentConfig?.agentId );
	setSessionSiteKey( value.siteKey );

	return (
		<AgentsManagerContext.Provider
			value={ {
				...defaultContext,
				...value,
				isLoggedIn,
				agentConfig,
				setAgentConfig,
				getTabSessionId,
				resumeChat,
			} }
		>
			{ children }
		</AgentsManagerContext.Provider>
	);
};

/**
 * Hook to access `AgentsManager` context data.
 *
 * Must be used within an `AgentsManagerContextProvider`.
 * @returns The current context value with user, site, and section data.
 */
export function useAgentsManagerContext(): AgentsManagerContextType {
	return useContext( AgentsManagerContext );
}
