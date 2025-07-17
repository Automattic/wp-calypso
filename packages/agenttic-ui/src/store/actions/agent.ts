import {
	extractTextFromMessage,
	getAgentManager,
} from '@automattic/agenttic-client';
import type {
	AgentOptions,
	AuthProvider,
	ContextProvider,
	ToolProvider,
} from '../types';

// Constants
const localToolRunningMessage = 'Running tool...';

interface RunAgentOptions extends AgentOptions {
	agentId?: string;
	agentUrl?: string;
	contextProvider?: ContextProvider;
	toolProvider?: ToolProvider;
	authProvider?: AuthProvider;
}

/**
 * Store action to send a streaming message to the agenttic agent.
 * This provides a way to send streaming messages from anywhere in the app without hooks
 * Handles the complete conversation flow internally - adds messages to store, manages thinking state, etc.
 * @param message
 * @param options
 */
export const runAgent =
	( message: string, options: RunAgentOptions = {} ) =>
	async ( { select, dispatch }: any ) => {
		const {
			withHistory = true,
			agentKey = 'agenttic-ui-stream',
			sessionId = 'default-session',
			agentId = 'test-agent',
			agentUrl = 'https://public-api.wordpress.com/wpcom/v2/ai/agent',
			contextProvider,
			toolProvider,
			authProvider,
			...otherOptions
		} = options;

		// Delete any existing CompletedPlan messages before starting new agent run
		dispatch.deleteCompletedPlanMessages();

		try {
			const assistantId = select.getAssistant();
			const messages = select.getMessages();

			let agentQuickActionMessage;

			// If there is only one message in the store and it is from the assistant
			// it must be a quick action message so we need to include it in the call
			// to the agent.
			if (
				messages.length === 1 &&
				messages[ 0 ]?.role === 'assistant' &&
				messages[ 0 ]?.content[ 0 ]?.type === 'text'
			) {
				agentQuickActionMessage = messages[ 0 ]?.content[ 0 ]?.text;
			}

			// Add user message to store
			dispatch.addUserMessage( message );

			// Set thinking state and add thinking message
			dispatch.setThinking( true );

			const agentManager = getAgentManager();

			// Ensure agent exists (create if needed)
			if ( ! agentManager.hasAgent( agentKey ) ) {
				const config: any = {
					agentId,
					agentUrl,
					sessionId,
				};

				if ( contextProvider ) {
					config.contextProvider = contextProvider;
				}

				if ( toolProvider ) {
					config.toolProvider = toolProvider;
				}

				if ( authProvider ) {
					config.authProvider = authProvider;
				}

				await agentManager.createAgent( agentKey, config );
			}

			let finalResponse = '';
			let hasAddedAssistantMessage = false;

			const messageToSend = agentQuickActionMessage
				? `Agent question: ${ agentQuickActionMessage } \n\n User reply: ${ message }`
				: message;

			// Process streaming updates internally
			for await ( const update of agentManager.sendMessageStream(
				agentKey,
				messageToSend,
				{
					withHistory,
					sessionId,
					...otherOptions,
				}
			) ) {
				// Handle text updates for real-time streaming display
				if ( update?.text ) {
					if (
						! hasAddedAssistantMessage &&
						update.text !== localToolRunningMessage
					) {
						// Add initial assistant message
						dispatch.assistantSay( update.text, {
							showIcon: true,
							icon: 'assistant',
						} );
						hasAddedAssistantMessage = true;
					}

					if ( update.final ) {
						finalResponse = update.text;
						break;
					}
				}
			}

			// Clear thinking state
			dispatch.setThinking( false );

			if ( finalResponse !== localToolRunningMessage ) {
				// Remove thinking messages by processing messages marked for deletion
				const messagesToDelete = select.getMessagesToDelete();
				messagesToDelete
					.filter( ( messageToDelete: any ) => messageToDelete.id )
					.forEach( ( messageToDelete: any ) => {
						dispatch.deleteMessage( messageToDelete.id );
					} );
				dispatch.clearMessagesToDelete();
			}

			if (
				finalResponse &&
				! hasAddedAssistantMessage &&
				finalResponse !== localToolRunningMessage
			) {
				dispatch.assistantSay( finalResponse, {
					showIcon: true,
					icon: 'assistant',
				} );
			}

			return finalResponse || 'Response received';
		} catch ( error: any ) {
			// Clear thinking state on error
			dispatch.setThinking( false );

			// Remove thinking messages by processing messages marked for deletion
			const messagesToDelete = select.getMessagesToDelete();
			messagesToDelete
				.filter( ( messageToDelete: any ) => messageToDelete.id )
				.forEach( ( messageToDelete: any ) => {
					dispatch.deleteMessage( messageToDelete.id );
				} );
			dispatch.clearMessagesToDelete();

			console.error( 'Error in runAgent:', error );
			dispatch.setError( 'Agenttic error: ' + error.message );
			throw error;
		}
	};

/**
 * Store action to clear all agent instances
 * Useful for cleanup or resetting state
 */
export const clearAgents = () => async () => {
	try {
		const agentManager = getAgentManager();
		agentManager.clear();
		console.info( 'All agenttic agents cleared' );
	} catch ( error ) {
		console.error( 'Error clearing agenttic agents:', error );
	}
};

/**
 * Store action to remove a specific agent instance
 * @param agentKey
 */
export const removeAgent = ( agentKey: string ) => async () => {
	try {
		const agentManager = getAgentManager();
		const removed = agentManager.removeAgent( agentKey );

		if ( removed ) {
			console.info( `Agenttic agent '${ agentKey }' removed` );
		} else {
			console.warn( `Agenttic agent '${ agentKey }' not found` );
		}

		return removed;
	} catch ( error ) {
		console.error(
			`Error removing agenttic agent '${ agentKey }':`,
			error
		);
		return false;
	}
};

/**
 * Store action to check if an agent exists
 * @param agentKey
 */
export const hasAgent = ( agentKey: string ) => () => {
	try {
		const agentManager = getAgentManager();
		return agentManager.hasAgent( agentKey );
	} catch ( error ) {
		console.error(
			`Error checking agenttic agent '${ agentKey }':`,
			error
		);
		return false;
	}
};

/**
 * Store action to reset conversation for a specific agent
 * @param agentKey
 */
export const resetConversation =
	( agentKey: string = 'agenttic-ui-stream' ) =>
	async () => {
		try {
			const agentManager = getAgentManager();

			if ( agentManager.hasAgent( agentKey ) ) {
				await agentManager.resetConversation( agentKey );
				console.info( `Conversation reset for agent '${ agentKey }'` );
			} else {
				console.info(
					`Agent '${ agentKey }' not found for conversation reset`
				);
			}
		} catch ( error ) {
			console.error(
				`Error resetting conversation for agent '${ agentKey }':`,
				error
			);
		}
	};

/**
 * Store action to load conversation history from agent manager into UI store
 * @param agentKey - The agent key to load conversation history for
 */
export const loadConversationHistory =
	( agentKey: string ) =>
	async ( { dispatch }: any ) => {
		try {
			const agentManager = getAgentManager();
			if ( agentManager.hasAgent( agentKey ) ) {
				const clientMessages =
					agentManager.getConversationHistory( agentKey );

				// Convert and add each message using existing utilities and actions
				clientMessages.forEach( ( clientMsg ) => {
					const textContent = extractTextFromMessage( clientMsg );

					if ( clientMsg.role === 'user' ) {
						dispatch.addUserMessage( textContent );
					} else {
						dispatch.assistantSay( textContent );
					}
				} );
			}
		} catch ( error ) {
			console.error(
				`Error loading conversation history for agent '${ agentKey }':`,
				error
			);
		}
	};
