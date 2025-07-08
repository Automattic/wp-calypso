import type {
	Client,
	ClientConfig,
	SendMessageParams,
	Task,
	Message,
	TaskUpdate,
	DataPart,
	TextPart,
} from '../client/types/index';
import { createClient } from '../client/index';
import {
	createTextMessage,
	extractToolCallsFromMessage,
	generateMessageId,
} from '../client/utils/index';
import { log } from '../client/utils/logger';
import {
	clearConversation,
	loadConversation,
	storeConversation,
} from './conversationStorage';
import {
	extractNewContentFromMessage,
	createTextMessageWithHistory,
	extractToolResultsFromMessage,
} from './conversationUtils';

/**
 * Configuration for agent manager
 */
export interface AgentManagerConfig extends ClientConfig {
	key?: string;
	sessionId?: string;
}

/**
 * Agent instance with conversation tracking
 */
interface ManagedAgent {
	client: Client;
	sessionId: string | null;
	conversationHistory: Message[];
}



/**
 * Agent manager interface
 */
export interface AgentManager {
	createAgent: (
		key: string,
		config: AgentManagerConfig
	) => Promise< Client >;
	getAgent: ( key: string ) => Client | null;
	hasAgent: ( key: string ) => boolean;
	removeAgent: ( key: string ) => boolean;
	sendMessage: (
		key: string,
		message: string,
		options?: Partial< SendMessageParams >
	) => Promise< Task >;
	sendMessageStream: (
		key: string,
		message: string,
		options?: Partial< SendMessageParams >
	) => AsyncIterable< TaskUpdate >;
	resetConversation: ( key: string ) => Promise< void >;
	getConversationHistory: ( key: string ) => Message[];
	clear: () => void;
}

/**
 * Create a functional agent manager using closures
 */
function createAgentManager(): AgentManager {
	// Private state using closure
	const agents = new Map< string, ManagedAgent >();

	/**
	 * Persist conversation history for an agent
	 * @param key
	 * @param messages
	 */
	async function persistConversationHistory(
		key: string,
		messages: Message[]
	): Promise< void > {
		const agent = agents.get( key );
		if ( agent?.sessionId ) {
			try {
				await storeConversation( agent.sessionId, messages );
			} catch ( error ) {
				log(
					`Failed to persist conversation history for agent ${ key }:`,
					error
				);
			}
		}
	}

	return {
		async createAgent(
			key: string,
			config: AgentManagerConfig
		): Promise< Client > {
			if ( agents.has( key ) ) {
				return agents.get( key )!.client;
			}

			const client = createClient( config );
			const sessionId = config.sessionId || null;

			// Load existing conversation history if sessionId is provided
			let conversationHistory: Message[] = [];
			if ( sessionId ) {
				try {
					conversationHistory = await loadConversation( sessionId );
				} catch ( error ) {
					log(
						`Failed to load conversation history for agent ${ key } with session ${ sessionId }:`,
						error
					);
				}
			}

			const managedAgent: ManagedAgent = {
				client,
				sessionId,
				conversationHistory,
			};

			agents.set( key, managedAgent );
			return client;
		},

		getAgent( key: string ): Client | null {
			const agent = agents.get( key );
			return agent?.client || null;
		},

		hasAgent( key: string ): boolean {
			return agents.has( key );
		},

		removeAgent( key: string ): boolean {
			return agents.delete( key );
		},

		async sendMessage(
			key: string,
			message: string,
			options: Partial< SendMessageParams > = {}
		): Promise< Task > {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			const { withHistory = true, ...otherOptions } = options;
			const { client, conversationHistory } = managedAgent;

			const messageObj: Message =
				options.message ||
				( withHistory
					? createTextMessageWithHistory(
							message,
							conversationHistory
					  )
					: createTextMessage( message ) );

			const task = await client.sendMessage( {
				message: messageObj,
				withHistory,
				...otherOptions,
			} );

			// Update conversation history if withHistory is true
			if ( withHistory ) {
				// Create a complete agent message with tool calls and results if present
				let completeAgentMessage: Message | null = null;
				if ( task.status?.message ) {
					// Extract all tool-related parts from the final message
					const toolParts = task.status.message.parts.filter(
						( part ) =>
							part.type === 'data' &&
							'toolCallId' in part.data &&
							( 'arguments' in part.data ||
								'result' in part.data )
					);

					// Extract text parts from final message
					const textParts = task.status.message.parts.filter(
						( part ) => part.type === 'text'
					);

					// Create complete message with tool parts + text parts in proper order
					completeAgentMessage = {
						role: 'agent',
						kind: 'message',
						parts: [ ...toolParts, ...textParts ],
						messageId: generateMessageId(),
					};
				}

				const newConversationHistory = [
					...conversationHistory,
					// Store only the new content from the user message (without history parts)
					createTextMessage( message ),
					// Add complete agent response with tool calls/results if present
					...( completeAgentMessage
						? [
								extractNewContentFromMessage(
									completeAgentMessage
								),
						  ]
						: [] ),
				];

				// Check if there's a separate agent message to add
				let finalConversationHistory = newConversationHistory;
				if ( ( task as any ).agentMessage ) {
					const separateAgentMessage = extractNewContentFromMessage(
						( task as any ).agentMessage
					);
					finalConversationHistory = [
						...newConversationHistory,
						separateAgentMessage,
					];
				}

				// Update the agent's conversation history
				managedAgent.conversationHistory = finalConversationHistory;

				// Persist the updated conversation history
				await persistConversationHistory(
					key,
					finalConversationHistory
				);
			}

			return task;
		},

		async *sendMessageStream(
			key: string,
			message: string,
			options: Partial< SendMessageParams > = {}
		): AsyncIterable< TaskUpdate > {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			const { withHistory = true, ...otherOptions } = options;
			const { client } = managedAgent;

			// Track conversation history locally to avoid race conditions
			let currentConversationHistory = [
				...managedAgent.conversationHistory,
			];

			// Track current tool call IDs to ensure we only capture matching tool results
			let currentToolCallIds: string[] = [];

			const messageObj: Message =
				options.message ||
				( withHistory
					? createTextMessageWithHistory(
							message,
							currentConversationHistory
					  )
					: createTextMessage( message ) );

			// Add user message to local conversation history before streaming (only if withHistory is true)
			if ( withHistory ) {
				const userMessage = createTextMessage( message );
				currentConversationHistory = [
					...currentConversationHistory,
					userMessage,
				];

				// Update agent's conversation history immediately
				managedAgent.conversationHistory = currentConversationHistory;
				// Persist the user message immediately
				await persistConversationHistory(
					key,
					currentConversationHistory
				);
			}

			for await ( const update of client.sendMessageStream( {
				message: messageObj,
				withHistory,
				...otherOptions,
			} ) ) {
				// Save tool interactions when input is required (this saves the agent message with tool calls)
				if (
					update.status?.state === 'input-required' &&
					update.status?.message &&
					withHistory
				) {
					// Capture the tool call IDs for this batch
					const toolCalls = extractToolCallsFromMessage(
						update.status.message
					);
					currentToolCallIds = toolCalls.map(
						( call ) => call.data.toolCallId as string
					);

					const toolMessage = extractNewContentFromMessage(
						update.status.message
					);
					currentConversationHistory = [
						...currentConversationHistory,
						toolMessage,
					];

					// Update agent's conversation history immediately
					managedAgent.conversationHistory =
						currentConversationHistory;
					await persistConversationHistory(
						key,
						currentConversationHistory
					);
				}

				// Capture tool results when tools are executed (state becomes 'working' after tool execution)
				if (
					update.status?.state === 'working' &&
					update.status?.message &&
					withHistory &&
					! update.final
				) {
					// Extract ALL tool results first
					const allToolResults = extractToolResultsFromMessage(
						update.status.message
					);

					// Filter to only include results that match current tool call IDs
					const currentToolResults = allToolResults.filter(
						( result ) =>
							currentToolCallIds.includes(
								result.data.toolCallId as string
							)
					);

					if ( currentToolResults.length > 0 ) {
						// Create a message containing just the matching tool results
						const toolResultMessage: Message = {
							role: 'agent',
							kind: 'message',
							parts: currentToolResults,
							messageId: generateMessageId(),
						};

						currentConversationHistory = [
							...currentConversationHistory,
							extractNewContentFromMessage( toolResultMessage ),
						];

						// Update agent's conversation history immediately
						managedAgent.conversationHistory =
							currentConversationHistory;
						await persistConversationHistory(
							key,
							currentConversationHistory
						);
					}
				}

				if (
					update.final &&
					update.status?.state !== 'input-required'
				) {
					// Clear tool call tracking for next batch
					currentToolCallIds = [];

					let finalAgentMessage: Message | null = null;
					if ( withHistory && update.status?.message ) {
						finalAgentMessage = extractNewContentFromMessage(
							update.status.message
						);
						currentConversationHistory = [
							...currentConversationHistory,
							finalAgentMessage,
						];

						// Update agent's conversation history
						managedAgent.conversationHistory =
							currentConversationHistory;
						// Persist the final conversation history
						await persistConversationHistory(
							key,
							currentConversationHistory
						);
					}
				}

				yield update;
			}
		},

		async resetConversation( key: string ): Promise< void > {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			managedAgent.conversationHistory = [];

			// Clear persistent storage as well
			if ( managedAgent.sessionId ) {
				await clearConversation( managedAgent.sessionId );
			}
		},

		getConversationHistory( key: string ): Message[] {
			const managedAgent = agents.get( key );
			if ( ! managedAgent ) {
				throw new Error( `Agent with key "${ key }" not found` );
			}

			return [ ...managedAgent.conversationHistory ];
		},

		clear(): void {
			agents.clear();
		},
	};
}

// Global singleton instance
const globalAgentManager = createAgentManager();

/**
 * Get the global agent manager instance
 */
export function getAgentManager(): AgentManager {
	return globalAgentManager;
}
