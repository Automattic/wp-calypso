import { getAgentManager } from '@automattic/agenttic-client';
import { useDispatch } from '@wordpress/data';
import React, {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
} from 'react';
import { STORE_NAME } from '../store';
import type { AgentChatConfig } from '../store/types';
import {
	createDefaultAgentConfig,
	createNoOpContextProvider,
	createNoOpToolProvider,
	validateAgentConfig,
} from '../utils/agent-helpers';

interface AgentChatContextType {
	agentConfig: AgentChatConfig;
}

const AgentChatContext = createContext< AgentChatContextType | undefined >(
	undefined
);

interface AgentChatProviderProps {
	agentId: string;
	agentUrl?: string;
	sessionId?: string;
	contextProvider?: AgentChatConfig[ 'contextProvider' ];
	toolProvider?: AgentChatConfig[ 'toolProvider' ];
	authProvider?: AgentChatConfig[ 'authProvider' ];
	children: ReactNode;
}

/**
 * Provider component that configures agent chat settings for the entire component tree
 * This eliminates the need to pass agent configuration with every message
 * @param root0
 * @param root0.agentId
 * @param root0.agentUrl
 * @param root0.sessionId
 * @param root0.contextProvider
 * @param root0.toolProvider
 * @param root0.children
 * @param root0.authProvider
 */
export const AgentChatProvider: React.FC< AgentChatProviderProps > = ( {
	agentId,
	agentUrl,
	sessionId,
	contextProvider,
	toolProvider,
	authProvider,
	children,
} ) => {
	const dispatch = useDispatch( STORE_NAME );

	// Create config with defaults
	const defaultConfig = createDefaultAgentConfig();
	const config = {
		agentId,
		agentUrl: agentUrl || defaultConfig.agentUrl,
		sessionId: sessionId || defaultConfig.sessionId,
	};

	useEffect( () => {
		const initializeAgent = async () => {
			// If a session key is set and there is previous conversation history load it
			if ( config.sessionId ) {
				const agentManager = getAgentManager();
				const agentKey = `${ config.agentId }-${ config.sessionId }`;
				if ( ! agentManager.hasAgent( agentKey ) ) {
					await agentManager.createAgent( agentKey, {
						agentId: config.agentId,
						agentUrl: config.agentUrl,
						sessionId: config.sessionId,
						contextProvider:
							contextProvider || createNoOpContextProvider(),
						toolProvider: toolProvider || createNoOpToolProvider(),
						authProvider,
					} );
					dispatch.loadConversationHistory( agentKey );
				}
			}
		};
		initializeAgent();
	}, [
		config.sessionId,
		config.agentId,
		config.agentUrl,
		contextProvider,
		toolProvider,
		authProvider,
		dispatch,
	] );

	// Validate configuration
	if ( ! validateAgentConfig( config ) ) {
		return (
			<div
				style={ {
					display: 'flex',
					flexDirection: 'column',
					height: '500px',
					border: '1px solid #e1e4e8',
					borderRadius: '8px',
					backgroundColor: '#fff',
					alignItems: 'center',
					justifyContent: 'center',
					color: '#d73a49',
					textAlign: 'center',
					padding: '16px',
				} }
			>
				<div style={ { fontSize: '48px', marginBottom: '16px' } }>
					⚠️
				</div>
				<div
					style={ {
						fontSize: '18px',
						fontWeight: 600,
						marginBottom: '8px',
					} }
				>
					Invalid Agent Configuration
				</div>
				<div style={ { fontSize: '14px', opacity: 0.8 } }>
					Please provide a valid agentId
				</div>
			</div>
		);
	}

	const agentConfig: AgentChatConfig = {
		agentConfig: config,
		contextProvider: contextProvider || createNoOpContextProvider(),
		toolProvider: toolProvider || createNoOpToolProvider(),
		authProvider,
	};

	return (
		<AgentChatContext.Provider value={ { agentConfig } }>
			{ children }
		</AgentChatContext.Provider>
	);
};

/**
 * Hook to access agent chat configuration from context
 * @return Agent chat configuration
 * @throws Error if used outside of AgentChatProvider
 */
export const useAgentChatContext = (): AgentChatContextType => {
	const context = useContext( AgentChatContext );
	if ( ! context ) {
		throw new Error(
			'useAgentChatContext must be used within an AgentChatProvider'
		);
	}
	return context;
};
